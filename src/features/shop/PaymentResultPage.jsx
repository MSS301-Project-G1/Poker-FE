import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { Icon } from '@/shared/ui'
import { useAuth } from '@/features/auth'
import { Button } from './shared/ui'
import { useWallet } from './hooks/useWallet'
import * as paymentService from './services/paymentService'
import { formatVipCoin } from './utils/shopFormatters'
import { canPayOrder, isPaymentComplete, paymentPresentation, recalledPaymentOrderId, rememberPaymentOrder, shouldPollOrder } from './utils/paymentStatus'
import PendingPaymentModal from './components/PendingPaymentModal/PendingPaymentModal'

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const orderCode = searchParams.get('orderCode')
  return <PaymentResult key={`${user?.accountId}:${orderCode || 'stored'}`} accountId={user?.accountId} orderCode={orderCode} />
}

function PaymentResult({ accountId, orderCode }) {
  const navigate = useNavigate()
  const { wallet, vipCoin, refreshWallet } = useWallet()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Redirect parameters identify an order; they never confirm payment or delivery.

  const acceptOrder = useCallback(updated => {
    if (!updated?.id) throw new Error('The server did not return this order.')
    setOrder(updated)
    setError(null)
    rememberPaymentOrder(updated)
    return updated
  }, [])

  useEffect(() => {
    if (!accountId || isModalOpen) return
    let disposed = false
    let timer
    let targetId = null
    const controller = new AbortController()
    async function check() {
      try {
        if (!targetId) {
          if (orderCode) {
            const history = (await paymentService.getMyOrders({ signal: controller.signal }))?.data
            targetId = (Array.isArray(history) ? history : []).find(item => String(item.payosOrderCode) === orderCode)?.id
          } else {
            targetId = recalledPaymentOrderId(accountId)
          }
          if (!targetId) throw new Error('Couldn’t find this payment in your orders. Contact support with your order number.')
        }
        const updated = (await paymentService.getOrderDetail(targetId, { signal: controller.signal }))?.data
        if (disposed) return
        acceptOrder(updated)
        if (isPaymentComplete(updated)) refreshWallet()
        if (shouldPollOrder(updated)) timer = setTimeout(check, 4000)
      } catch (err) {
        if (disposed) return
        setError(err.message || 'Couldn’t confirm payment. Check again in a moment.')
        // Retry a known order after a transient failure; never create a replacement payment.
        if (targetId && ![401, 403, 404].includes(err.status)) timer = setTimeout(check, 4000)
      } finally { if (!disposed) setLoading(false) }
    }
    void check()
    return () => { disposed = true; controller.abort(); clearTimeout(timer) }
  }, [accountId, orderCode, retry, isModalOpen, acceptOrder, refreshWallet])

  const syncOrder = useCallback(async id => acceptOrder((await paymentService.syncOrder(id))?.data), [acceptOrder])
  const cancelOrder = useCallback(async id => acceptOrder((await paymentService.cancelOrder(id))?.data), [acceptOrder])
  const view = paymentPresentation(order)
  const tone = view.tone === 'success' ? 'bg-success/20 text-success' : view.tone === 'error' ? 'bg-error/20 text-error' : 'bg-tertiary/20 text-tertiary'
  const title = !order && error ? 'Payment not confirmed' : view.title

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg p-6 sm:p-9 rounded-2xl bg-surface-container-low border border-outline-variant/50 shadow-raised text-center">
        <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center ${tone}`}><Icon name={view.icon} className="text-5xl" /></div>
        <h1 className="font-headline font-bold text-2xl md:text-3xl text-on-surface mb-2">{title}</h1>
        <p className="text-sm text-on-surface/60 mb-6">{view.description}</p>
        {error && <p role="alert" className="text-sm text-error mb-4">{error}</p>}
        <div className="rounded-2xl bg-obsidian/40 border border-on-surface/10 p-5 mb-6 text-left space-y-3 text-xs text-on-surface/70">
          <div className="flex justify-between"><span>Order:</span><span className="font-mono text-tertiary">#{order?.payosOrderCode || orderCode || 'N/A'}</span></div>
          <div className="flex justify-between"><span>Server payment status:</span><span>{order?.status || 'Not confirmed'}</span></div>
          <div className="flex justify-between"><span>Delivery status:</span><span>{order?.fulfillmentStatus || 'Not confirmed'}</span></div>
          <div className="flex justify-between"><span>Current balance:</span><span>{wallet ? `${formatVipCoin(vipCoin)} VIP Coin` : 'Not available'}</span></div>
        </div>
        <div className="space-y-3">
          {error && <Button variant="secondary" icon="sync" disabled={loading} onClick={() => { setLoading(true); setRetry(value => value + 1) }} className="w-full">Check again</Button>}
          {canPayOrder(order) && <Button variant="gold" icon="qr_code_2" onClick={() => setIsModalOpen(true)} className="w-full">Continue this payment</Button>}
          {['CANCELLED', 'EXPIRED'].includes(order?.status) && <Button variant="secondary" icon="replay" onClick={() => navigate('/shop/bundles')} className="w-full">Choose another pack</Button>}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="gold" icon="account_balance_wallet" onClick={() => navigate('/shop?tab=wallet')}>View wallet</Button>
            <Button variant="secondary" icon="storefront" onClick={() => navigate('/shop')}>Back to shop</Button>
          </div>
        </div>
      </div>
      <PendingPaymentModal key={order?.id} order={order} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCancelOrder={cancelOrder} onSyncOrder={syncOrder} onSuccess={refreshWallet} />
    </div>
  )
}
