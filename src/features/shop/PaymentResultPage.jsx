import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'
import { Button } from './shared/ui'
import { useWallet } from './hooks/useWallet'
import { usePendingOrder } from './hooks/usePendingOrder'
import * as paymentService from './services/paymentService'
import { formatVipCoin } from './utils/shopFormatters'
import PendingPaymentModal from './components/PendingPaymentModal/PendingPaymentModal'

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { wallet, vipCoin, refreshWallet } = useWallet()
  const { pendingOrder, cancelPendingOrder, syncPendingOrder, checkPendingOrder } = usePendingOrder()

  const [isModalOpen, setIsModalOpen] = useState(false)

  // Query parameters from PayOS return URL
  // e.g. /shop/payment/success?code=00&id=...&cancel=false&status=PAID&orderCode=100006
  const code = searchParams.get('code')
  const status = searchParams.get('status')
  const cancel = searchParams.get('cancel')
  const orderCode = searchParams.get('orderCode')
  const transactionId = searchParams.get('id')

  const isSuccess = useMemo(() => {
    if (cancel === 'true') return false
    return status === 'PAID' || code === '00'
  }, [cancel, status, code])

  // Synchronize payment order status with PayOS first, then refresh wallet balance immediately
  useEffect(() => {
    let disposed = false
    let timer1 = null
    let timer2 = null

    async function syncAndRefreshBalance() {
      try {
        // 1. Trigger pending order check (which syncs active pending order with PayOS on backend)
        const activeOrder = await checkPendingOrder()
        if (disposed) return

        // 2. If still pending or if orderCode is provided on a success return URL, explicitly sync that order
        if (activeOrder?.id && activeOrder.status === 'PENDING') {
          await syncPendingOrder(activeOrder.id)
        } else if (isSuccess && orderCode) {
          try {
            const ordersRes = await paymentService.getMyOrders()
            const matchedOrder = (ordersRes?.data || []).find(
              o => String(o.payosOrderCode) === String(orderCode)
            )
            if (matchedOrder?.id && matchedOrder.status === 'PENDING') {
              await paymentService.syncOrder(matchedOrder.id)
            }
          } catch {
            // ignore fallback lookup error
          }
        }
      } finally {
        if (!disposed) {
          refreshWallet()
          // Follow-up refreshes to catch async RabbitMQ wallet credit completion without needing F5
          timer1 = setTimeout(() => {
            if (!disposed) refreshWallet()
          }, 400)
          timer2 = setTimeout(() => {
            if (!disposed) refreshWallet()
          }, 1200)
        }
      }
    }

    void syncAndRefreshBalance()

    return () => {
      disposed = true
      if (timer1) clearTimeout(timer1)
      if (timer2) clearTimeout(timer2)
    }
  }, [isSuccess, orderCode, checkPendingOrder, syncPendingOrder, refreshWallet])

  // Safe navigation helpers
  const handleGoToWallet = useCallback(() => {
    navigate('/shop?tab=wallet')
  }, [navigate])

  const handleGoToShop = useCallback(() => {
    navigate('/shop')
  }, [navigate])

  const handleRetryBundles = useCallback(() => {
    navigate('/shop/bundles')
  }, [navigate])

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg p-6 sm:p-9 rounded-2xl bg-surface-container-low border border-outline-variant/50 shadow-raised relative overflow-hidden text-center">
        {/* Top celebratory accent bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isSuccess
              ? ' bg-success'
              : ' bg-error'
          }`}
        />

        {/* Status Icon */}
        <div className="flex justify-center mb-5">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-raised border relative ${
              isSuccess
                ? 'bg-success/20 text-success border-success/40 '
                : 'bg-error/20 text-error border-error/40 '
            }`}
          >
            <Icon
              name={isSuccess ? 'check_circle' : 'cancel'}
              className="text-5xl animate-bounce-short"
            />
          </div>
        </div>

        {/* Title & Headline */}
        <h1 className="font-headline font-bold text-2xl md:text-3xl text-on-surface mb-2">
          {isSuccess ? 'Payment complete' : 'Payment cancelled'}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface/60 mb-6 max-w-md mx-auto leading-relaxed">
          {isSuccess
            ? 'Your VIP Coin top-up through PayOS is complete. Your balance has been updated.'
            : 'The order wasn’t completed, or you cancelled it on PayOS.'}
        </p>

        {/* Order Details Receipt Box */}
        <div className="rounded-2xl bg-obsidian/40 border border-on-surface/10 p-4 sm:p-5 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between text-xs pb-2.5 border-b border-on-surface/10">
            <span className="text-on-surface/50">Order:</span>
            <span className="font-mono font-bold text-tertiary">
              #{orderCode || pendingOrder?.payosOrderCode || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2.5 border-b border-on-surface/10">
            <span className="text-on-surface/50">PayOS status:</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                isSuccess
                  ? 'bg-success/20 text-success border border-success/30'
                  : 'bg-error/20 text-error border border-error/30'
              }`}
            >
              {status || (isSuccess ? 'PAID' : 'CANCELLED')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2.5 border-b border-on-surface/10">
            <span className="text-on-surface/50">Method:</span>
            <span className="text-on-surface/80 font-medium">VietQR / PayOS</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-on-surface/50">Current balance:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-tertiary text-sm">
              <Icon name="paid" className="text-base" />
              <span>{formatVipCoin(vipCoin)} VIP Coin</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        {isSuccess ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="gold"
              size="md"
              icon="account_balance_wallet"
              onClick={handleGoToWallet}
              className="w-full"
            >
              View wallet
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon="storefront"
              onClick={handleGoToShop}
              className="w-full"
            >
              Back to shop
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* If there is an active pending order, offer resume CTA */}
            {pendingOrder && (
              <Button
                variant="gold"
                size="md"
                icon="qr_code_2"
                onClick={() => setIsModalOpen(true)}
                className="w-full shadow-lg"
              >
                Continue this payment
              </Button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                variant={pendingOrder ? 'secondary' : 'primary'}
                size="md"
                icon="replay"
                onClick={handleRetryBundles}
                className="w-full"
              >
                Try another pack
              </Button>

              <Button
                variant="secondary"
                size="md"
                icon="storefront"
                onClick={handleGoToShop}
                className="w-full"
              >
                Back to shop
              </Button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoToWallet}
                className="text-xs text-tertiary/80 hover:text-tertiary-fixed font-semibold flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                <Icon name="account_balance_wallet" className="text-sm" />
                <span>Check your balance in Wallet & history</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pending Payment Modal (allows user to resume checkout if they accidentally exited PayOS) */}
      <PendingPaymentModal
        order={pendingOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCancelOrder={cancelPendingOrder}
        onSyncOrder={syncPendingOrder}
        onSuccess={async () => {
          await refreshWallet()
          await checkPendingOrder()
        }}
      />
    </div>
  )
}
