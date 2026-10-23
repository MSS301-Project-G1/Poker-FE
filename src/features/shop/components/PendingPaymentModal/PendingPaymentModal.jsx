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
            notify('Thanh toán thành công! VIP Coin đã được cộng vào ví.', { type: 'success' })
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
        notify('Thanh toán thành công! VIP Coin đã được cộng vào ví.', { type: 'success' })
        if (onSuccess) onSuccess(res)
      } else {
        notify('Đơn hàng vẫn đang chờ thanh toán. Vui lòng quét mã và thử lại.', { type: 'info' })
      }
    } catch (err) {
      notify(err.message || 'Chưa nhận được giao dịch. Vui lòng thử lại sau giây lát.', { type: 'error' })
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
      notify('Đã hủy phiên thanh toán.', { type: 'info' })
      onClose()
    } catch (err) {
      notify(err.message || 'Không thể hủy đơn hàng', { type: 'error' })
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
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isExpired
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              <Icon
                name={paidSuccess ? 'check_circle' : isExpired ? 'hourglass_disabled' : 'pending_actions'}
                className="text-2xl"
              />
            </div>
            <div className="text-left">
              <h3 className="font-headline font-black text-lg text-white">
                {paidSuccess
                  ? 'Thanh Toán Thành Công!'
                  : isExpired
                  ? 'Phiên Thanh Toán Đã Hết Hạn'
                  : 'Tiếp Tục Thanh Toán'}
              </h3>
              <p className="text-xs text-white/60">
                {paidSuccess
                  ? 'Hệ thống đã ghi nhận thanh toán và cộng VIP Coin vào ví của bạn.'
                  : isExpired
                  ? 'Giao dịch đã quá 5 phút. Vui lòng hủy để tạo phiên mới.'
                  : 'Đơn hàng đang chờ quét mã VietQR hoặc thanh toán trên PayOS.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        {/* Body */}
        {paidSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Icon name="verified" className="text-4xl" />
            </div>
            <p className="text-sm font-semibold text-emerald-300">
              Bạn đã nạp thành công {formatVipCoin(order.vipCoinAmount)} VIP Coin!
            </p>
            <Button variant="gold" size="md" icon="check" onClick={onClose} className="w-full">
              Hoàn Tất
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Live Countdown & Order summary */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-white/50">Mã đơn:</span>
                <span className="font-mono font-bold text-amber-400">#{order.payosOrderCode}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-white/50">Thời gian còn lại:</span>
                <span
                  className={`font-mono font-bold text-sm px-2 py-0.5 rounded-md ${
                    isExpired
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-amber-500/20 text-amber-300 animate-pulse'
                  }`}
                >
                  <Icon name="schedule" className="text-xs mr-1 align-baseline inline" />
                  {formattedCountdown}
                </span>
              </div>
            </div>

            {/* QR Code and Info block */}
            {!isExpired && order.qrImageUrl && (
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="bg-white p-2.5 rounded-2xl shadow-xl max-w-[200px] mb-2">
                  <img
                    src={order.qrImageUrl}
                    alt="VietQR PayOS"
                    className="w-full h-auto aspect-square object-contain"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-amber-400">
                    {order.bundleName || order.productName || 'Nạp VIP Coin'} • {formatVnd(order.amountVnd)}
                  </p>
                  <p className="text-[11px] text-white/50">
                    Mở App Ngân hàng hoặc ví điện tử để quét mã thanh toán tức thì
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
                    Mở Lại Trang Thanh Toán PayOS
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    icon="sync"
                    loading={isSyncing}
                    onClick={handleManualCheck}
                    className="w-full"
                  >
                    Tôi Đã Thanh Toán (Kiểm Tra Ngay)
                  </Button>
                </>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancel}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors underline-offset-2 hover:underline"
                >
                  <Icon name="cancel" className="text-sm" />
                  <span>{isCancelling ? 'Đang hủy đơn...' : 'Hủy đơn hàng này để tạo đơn mới'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-white/40 hover:text-white/80 transition-colors"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
