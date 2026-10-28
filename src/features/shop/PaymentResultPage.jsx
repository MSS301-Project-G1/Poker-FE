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
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[160px] ${
            isSuccess ? 'bg-emerald-500/15' : 'bg-rose-500/15'
          }`}
        />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-lg p-6 sm:p-9 rounded-3xl bg-gradient-to-b from-[#1b0f33]/95 to-[#100620]/95 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center">
        {/* Top celebratory accent bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isSuccess
              ? 'bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400'
              : 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500'
          }`}
        />

        {/* Status Icon */}
        <div className="flex justify-center mb-5">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl border relative ${
              isSuccess
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40 shadow-emerald-500/20'
                : 'bg-rose-500/20 text-rose-400 border-rose-400/40 shadow-rose-500/20'
            }`}
          >
            <Icon
              name={isSuccess ? 'check_circle' : 'cancel'}
              className="text-5xl animate-bounce-short"
            />
          </div>
        </div>

        {/* Title & Headline */}
        <h1 className="font-headline font-black text-2xl md:text-3xl text-white mb-2">
          {isSuccess ? 'Thanh Toán Thành Công!' : 'Giao Dịch Đã Bị Hủy'}
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mb-6 max-w-md mx-auto leading-relaxed">
          {isSuccess
            ? 'Giao dịch nạp VIP Coin qua cổng thanh toán PayOS đã hoàn tất. Số dư ví đã được cập nhật tức thì.'
            : 'Đơn hàng chưa hoàn tất hoặc bạn đã bấm hủy giao dịch trên cổng thanh toán PayOS.'}
        </p>

        {/* Order Details Receipt Box */}
        <div className="rounded-2xl bg-black/40 border border-white/10 p-4 sm:p-5 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between text-xs pb-2.5 border-b border-white/10">
            <span className="text-white/50">Mã đơn hàng:</span>
            <span className="font-mono font-bold text-amber-400">
              #{orderCode || pendingOrder?.payosOrderCode || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2.5 border-b border-white/10">
            <span className="text-white/50">Trạng thái PayOS:</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {status || (isSuccess ? 'PAID' : 'CANCELLED')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2.5 border-b border-white/10">
            <span className="text-white/50">Phương thức:</span>
            <span className="text-white/80 font-medium">VietQR / PayOS</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-white/50">Số dư ví hiện tại:</span>
            <div className="flex items-center gap-1.5 font-mono font-black text-amber-400 text-sm">
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
              Xem Ví Của Bạn
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon="storefront"
              onClick={handleGoToShop}
              className="w-full"
            >
              Về Cửa Hàng
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
                className="w-full shadow-lg shadow-amber-500/20"
              >
                Tiếp Tục Thanh Toán Đơn Này (Còn Hạn)
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
                Thử Lại Gói Nạp
              </Button>

              <Button
                variant="secondary"
                size="md"
                icon="storefront"
                onClick={handleGoToShop}
                className="w-full"
              >
                Về Cửa Hàng
              </Button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoToWallet}
                className="text-xs text-amber-400/80 hover:text-amber-300 font-semibold flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                <Icon name="account_balance_wallet" className="text-sm" />
                <span>Kiểm tra số dư tại Ví & Lịch Sử GD</span>
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
