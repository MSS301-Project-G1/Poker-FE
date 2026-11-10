import { useState, useEffect, useMemo, useCallback } from 'react'
import { Icon, useToast } from '@/shared/ui'
import { Button } from '../../shared/ui'
import { formatVipCoin, formatVnd } from '../../utils/shopFormatters'
import styles from './PendingPaymentModal.module.css'

export default function PendingPaymentModal({
  order,
  isOpen,
  onClose,
  onCancelOrder,
  onSyncOrder,
  onSuccess,
}) {
  const notify = useToast()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [paidSuccess, setPaidSuccess] = useState(false)
  const [now, setNow] = useState(Date.now())

  // Keep live timer updated every second
  useEffect(() => {
    if (!isOpen || !order) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [isOpen, order])

  // Calculate remaining seconds
  const remainingSeconds = useMemo(() => {
    if (!order?.expiresAt) return 0
    const expiryTime = new Date(order.expiresAt).getTime()
    const diff = Math.max(0, Math.floor((expiryTime - now) / 1000))
    return diff
  }, [order?.expiresAt, now])

  const formattedCountdown = useMemo(() => {
    const mins = Math.floor(remainingSeconds / 60)
    const secs = remainingSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [remainingSeconds])

  const isExpired = remainingSeconds <= 0

  // Polling to detect payment completion automatically
  useEffect(() => {
    if (!isOpen || !order || isExpired || paidSuccess) return

    const intervalId = setInterval(async () => {
      try {
        if (onSyncOrder) {
          const res = await onSyncOrder()
          if (res?.status === 'PAID') {
            setPaidSuccess(true)
            notify('Payment complete. VIP Coin has been added to your wallet.', { type: 'success' })
            if (onSuccess) onSuccess(res)
          }
        }
      } catch {
        // ignore background poll errors
      }
    }, 4000)

    return () => clearInterval(intervalId)
  }, [isOpen, order, isExpired, paidSuccess, onSyncOrder, onSuccess, notify])

  // Manual Check
  const handleManualCheck = async () => {
    if (!onSyncOrder || isSyncing) return
    setIsSyncing(true)
    try {
      const res = await onSyncOrder()
      if (res?.status === 'PAID') {
        setPaidSuccess(true)
        notify('Payment complete. VIP Coin has been added to your wallet.', { type: 'success' })
        if (onSuccess) onSuccess(res)
      } else {
        notify('This order is still awaiting payment. Scan the code and try again.', { type: 'info' })
      }
    } catch (err) {
      notify(err.message || 'Payment not received yet. Try again in a moment.', { type: 'error' })
    } finally {
      setIsSyncing(false)
    }
  }

  // Cancel Order
  const handleCancel = async () => {
    if (!onCancelOrder || isCancelling) return
    setIsCancelling(true)
    try {
      await onCancelOrder()
      notify('Payment session cancelled.', { type: 'info' })
      onClose()
    } catch (err) {
      notify(err.message || 'Couldn’t cancel the order', { type: 'error' })
    } finally {
      setIsCancelling(false)
    }
  }

  // Open Checkout URL in new tab
  const handleOpenPayOs = () => {
    if (order?.checkoutUrl) {
      window.open(order.checkoutUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (!isOpen || !order) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        {/* Accent bar */}
        <div
          className={`${styles.accentBar} ${
            paidSuccess
              ? styles.accentSuccess
              : isExpired
              ? styles.accentExpired
              : styles.accentPending
          }`}
        />

        {/* Modal Header */}
        <div className={styles.header}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                paidSuccess
                  ? 'bg-success/20 text-success'
                  : isExpired
                  ? 'bg-error/20 text-error'
                  : 'bg-tertiary/20 text-tertiary'
              }`}
            >
              <Icon
                name={paidSuccess ? 'check_circle' : isExpired ? 'hourglass_disabled' : 'pending_actions'}
                className="text-2xl"
              />
            </div>
            <div className="text-left">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                {paidSuccess
                  ? 'Payment complete'
                  : isExpired
                  ? 'Payment session expired'
                  : 'Continue payment'}
              </h3>
              <p className="text-xs text-on-surface/60">
                {paidSuccess
                  ? 'Your payment was recorded and VIP Coin was added to your wallet.'
                  : isExpired
                  ? 'This payment is older than 5 minutes. Cancel it to start a new one.'
                  : 'Waiting for you to scan the VietQR code or pay on PayOS.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface/40 hover:text-on-surface hover:bg-on-surface/10 transition-colors"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        {/* Body */}
        {paidSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/20 text-success flex items-center justify-center border border-success/30">
              <Icon name="verified" className="text-4xl" />
            </div>
            <p className="text-sm font-semibold text-success">
              You topped up {formatVipCoin(order.vipCoinAmount)} VIP Coin!
            </p>
            <Button variant="gold" size="md" icon="check" onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Live Countdown & Order summary */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-on-surface/5 border border-on-surface/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-on-surface/50">Order:</span>
                <span className="font-mono font-bold text-tertiary">#{order.payosOrderCode}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-on-surface/50">Time left:</span>
                <span
                  className={`font-mono font-bold text-sm px-2 py-0.5 rounded-md ${
                    isExpired
                      ? 'bg-error/20 text-error'
                      : 'bg-tertiary/20 text-tertiary-fixed '
                  }`}
                >
                  <Icon name="schedule" className="text-xs mr-1 align-baseline inline" />
                  {formattedCountdown}
                </span>
              </div>
            </div>

            {/* QR Code and Info block */}
            {!isExpired && order.qrImageUrl && (
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-obsidian/40 border border-on-surface/10">
                <div className="bg-card-face p-2.5 rounded-2xl shadow-raised max-w-[200px] mb-2">
                  <img
                    src={order.qrImageUrl}
                    alt="VietQR PayOS"
                    className="w-full h-auto aspect-square object-contain"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-tertiary">
                    {order.bundleName || order.productName || 'Top up VIP Coin'} • {formatVnd(order.amountVnd)}
                  </p>
                  <p className="text-[11px] text-on-surface/50">
                    Open your banking or e-wallet app to scan and pay
                  </p>
                </div>
              </div>
            )}

            {/* Actions Grid */}
            <div className="pt-2 flex flex-col gap-2.5">
              {!isExpired && (
                <>
                  <Button
                    variant="gold"
                    size="md"
                    icon="open_in_new"
                    onClick={handleOpenPayOs}
                    className="w-full"
                  >
                    Reopen PayOS checkout
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    icon="sync"
                    loading={isSyncing}
                    onClick={handleManualCheck}
                    className="w-full"
                  >
                    I’ve paid, check now
                  </Button>
                </>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancel}
                  className="text-xs text-error hover:text-error flex items-center gap-1 transition-colors underline-offset-2 hover:underline"
                >
                  <Icon name="cancel" className="text-sm" />
                  <span>{isCancelling ? 'Cancelling…' : 'Cancel this order and start a new one'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-on-surface/40 hover:text-on-surface/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
