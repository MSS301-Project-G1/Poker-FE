import { useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'
import { Button } from './shared/ui'
import { useWallet } from './hooks/useWallet'
import { formatVipCoin } from './utils/shopFormatters'

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { wallet, vipCoin, refreshWallet } = useWallet()

  // Query parameters from PayOS return URL
  // e.g. /shop/payment/success?code=00&id=6cfd9ec23645495b88699f7036f8a2f2&cancel=false&status=PAID&orderCode=100006
  const code = searchParams.get('code')
  const status = searchParams.get('status')
  const cancel = searchParams.get('cancel')
  const orderCode = searchParams.get('orderCode')
  const transactionId = searchParams.get('id')

  const isSuccess = useMemo(() => {
    if (cancel === 'true') return false
    return status === 'PAID' || code === '00'
  }, [cancel, status, code])

  // Automatically refresh user wallet on landing so balance is updated
  useEffect(() => {
    void refreshWallet()
  }, [refreshWallet])

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-12">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[150px] ${
            isSuccess ? 'bg-emerald-500/15' : 'bg-rose-500/15'
          }`}
        />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[130px]" />
      </div>

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-xl p-8 md:p-10 rounded-3xl bg-gradient-to-b from-[#1b0f33]/90 to-[#100620]/95 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center">
        {/* Top celebratory accent bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isSuccess
              ? 'bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400'
              : 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500'
          }`}
        />

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
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
        <p className="text-sm text-white/60 mb-8 max-w-md mx-auto">
          {isSuccess
            ? 'Giao dịch nạp VIP Coin qua cổng thanh toán PayOS đã hoàn tất. Số dư ví đã được cập nhật.'
            : 'Đơn hàng chưa được thanh toán hoặc bạn đã bấm hủy giao dịch trên cổng thanh toán.'}
        </p>

        {/* Order Details Receipt Box */}
        <div className="rounded-2xl bg-black/40 border border-white/10 p-5 mb-8 text-left space-y-3">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
            <span className="text-white/50">Mã đơn hàng:</span>
            <span className="font-mono font-bold text-amber-400">
              #{orderCode || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
            <span className="text-white/50">Trạng thái PayOS:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {status || (isSuccess ? 'PAID' : 'CANCELLED')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
            <span className="text-white/50">Phương thức:</span>
            <span className="text-white/80 font-medium">VietQR / PayOS</span>
          </div>

          {isSuccess && (
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-white/50">Số dư ví hiện tại:</span>
              <div className="flex items-center gap-1.5 font-mono font-black text-amber-400 text-sm">
                <Icon name="paid" className="text-base" />
                <span>{formatVipCoin(vipCoin)} VIP Coin</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="gold"
            size="lg"
            icon="account_balance_wallet"
            onClick={() => navigate('/shop?tab=wallet')}
            className="w-full sm:w-auto"
          >
            Xem Ví Của Bạn
          </Button>

          <Button
            variant="secondary"
            size="lg"
            icon="storefront"
            onClick={() => navigate('/shop')}
            className="w-full sm:w-auto"
          >
            Về Cửa Hàng
          </Button>

          {!isSuccess && (
            <Button
              variant="primary"
              size="lg"
              icon="restart_alt"
              onClick={() => navigate('/shop/bundles')}
              className="w-full sm:w-auto"
            >
              Thử Lại Gói Nạp
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
