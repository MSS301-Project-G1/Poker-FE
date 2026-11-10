import { useState, useEffect, useRef } from 'react'
import { Icon, useToast } from '@/shared/ui'
// These imports stay inside the shop feature; the generic depth rule flags this nested component.
// eslint-disable-next-line no-restricted-imports
import { Button } from '../../shared/ui'
// eslint-disable-next-line no-restricted-imports
import { formatVipCoin, formatVnd } from '../../utils/shopFormatters'
// eslint-disable-next-line no-restricted-imports
import { canPayOrder, isPaymentComplete, paymentPresentation, shouldPollOrder } from '../../utils/paymentStatus'
import PaymentQr from './PaymentQr'
import styles from './PendingPaymentModal.module.css'

export default function PendingPaymentModal({ order, isOpen, onClose, onCancelOrder, onSyncOrder, onSuccess }) {
  const notify = useToast()
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const busyRef = useRef(false)
  const notifiedRef = useRef(null)
  const poll = shouldPollOrder(order)

  useEffect(() => {
    if (!isOpen) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !isPaymentComplete(order) || notifiedRef.current === order.id) return
    notifiedRef.current = order.id
    notify('Payment and delivery are complete.', { type: 'success' })
    onSuccess?.(order)
  }, [isOpen, order, onSuccess, notify])

  // Schedule after each response so slow requests never accumulate overlapping polls.
  useEffect(() => {
    if (!isOpen || !order?.id || !poll || !onSyncOrder) return
    let disposed = false
    let timer
    async function check() {
      if (!busyRef.current) {
        busyRef.current = true
        try {
          await onSyncOrder(order.id)
          if (!disposed) setError(null)
        } catch (err) {
          if (!disposed) setError(err.message || 'Couldn’t confirm payment. We will check again.')
        } finally { busyRef.current = false }
      }
      if (!disposed) timer = setTimeout(check, 4000)
    }
    timer = setTimeout(check, 4000)
    return () => { disposed = true; clearTimeout(timer) }
  }, [isOpen, order?.id, poll, onSyncOrder])

  const handleAction = async action => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(action)
    setError(null)
    try {
      const updated = await (action === 'cancel' ? onCancelOrder(order.id) : onSyncOrder(order.id))
      const view = paymentPresentation(updated)
      notify(view.title, { type: isPaymentComplete(updated) ? 'success' : 'info' })
      if (action === 'cancel' && ['CANCELLED', 'EXPIRED'].includes(updated?.status)) onClose()
    } catch (err) {
      setError(err.message || 'Couldn’t confirm the order status. Try again.')
    } finally { busyRef.current = false; setBusy(null) }
  }

  if (!isOpen || !order) return null
  const view = paymentPresentation(order, now)
  const canPay = canPayOrder(order, now)
  const seconds = Math.max(0, Math.floor((Date.parse(order.expiresAt) - now) / 1000)) || 0
  const countdown = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const accent = view.tone === 'success' ? styles.accentSuccess : view.tone === 'error' ? styles.accentExpired : styles.accentPending

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
        <div className={`${styles.accentBar} ${accent}`} />
        <div className={styles.header}>
          <div className="flex items-center gap-3">
            <Icon name={view.icon} className="text-3xl text-tertiary" />
            <div className="text-left">
              <h3 id="payment-modal-title" className="font-headline font-bold text-lg text-on-surface">{view.title}</h3>
              <p className="text-xs text-on-surface/60">{view.description}</p>
            </div>
          </div>
          <button type="button" aria-label="Close payment" onClick={onClose} className="text-on-surface/60"><Icon name="close" /></button>
        </div>
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between text-xs text-on-surface/80">
            <span>Order #{order.payosOrderCode}</span>
            {canPay && <span>Time left: {countdown}</span>}
          </div>
          <p className="text-sm text-tertiary">{order.bundleName || order.productName} · {formatVnd(order.amountVnd)}</p>
          {canPay && <div className="mx-auto max-w-[240px] bg-card-face p-3 rounded-2xl"><PaymentQr key={order.id} order={order} /></div>}
          {isPaymentComplete(order) && order.vipCoinAmount != null && <p className="text-success text-sm">You topped up {formatVipCoin(order.vipCoinAmount)} VIP Coin.</p>}
          {error && <p role="alert" className="text-xs text-error">{error}</p>}
          {canPay && order.checkoutUrl && <Button variant="gold" icon="open_in_new" className="w-full" onClick={() => window.location.assign(order.checkoutUrl)}>Open checkout</Button>}
          {poll && <Button variant="secondary" icon="sync" loading={busy === 'sync'} disabled={Boolean(busy)} className="w-full" onClick={() => handleAction('sync')}>Check payment status</Button>}
          {order.status === 'PENDING' && <Button variant="secondary" loading={busy === 'cancel'} disabled={Boolean(busy)} className="w-full" onClick={() => handleAction('cancel')}>Cancel this order</Button>}
          <Button variant="secondary" className="w-full" onClick={onClose}>{isPaymentComplete(order) ? 'Done' : 'Close'}</Button>
        </div>
      </div>
    </div>
  )
}
