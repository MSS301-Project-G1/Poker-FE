import { useNavigate } from 'react-router'
import { Icon, useToast } from '@/shared/ui'
import { Button } from './shared/ui'
import { useBundleTopup } from './hooks/useBundleTopup'
import { useWallet } from './hooks/useWallet'
import { formatVipCoin, formatVnd } from './utils/shopFormatters'
import DevAccountSwitcher from './components/DevAccountSwitcher'

export default function BundlePage() {
  const navigate = useNavigate()
  const notify = useToast()
  const { bundles, loading, error, orderingBundleId, purchaseBundle } = useBundleTopup()
  const { vipCoin } = useWallet()

  const handleSelectBundle = async bundle => {
    try {
      await purchaseBundle(bundle.id)
    } catch (err) {
      notify(err.message || 'Không thể tạo đơn hàng thanh toán PayOS', { type: 'error' })
    }
  }

  return (
    <div className="relative w-full pb-space-lg overflow-hidden font-body-md">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-tertiary/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-20 left-10 w-[600px] h-[400px] bg-secondary-container/20 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-space-lg">
        {/* Top Navigation & Balance Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-space-md border-b border-outline-variant/30">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high/80 text-on-surface hover:bg-surface-container-highest transition-all text-xs font-bold border border-outline-variant/30"
            >
              <Icon name="arrow_back" className="text-sm" />
              <span>Quay Lại Cửa Hàng</span>
            </button>
            <div>
              <h1 className="font-headline font-black text-2xl md:text-3xl text-on-surface">
                Nạp VIP Coin
              </h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Cổng thanh toán tự động PayOS • Quét mã VietQR • Nạp tức thì
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DevAccountSwitcher />

            {/* Current Balance */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-container-high/90 border border-tertiary/40 shadow-lg">
              <span className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shadow-sm">
                <Icon name="paid" className="text-base" />
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-tertiary tracking-wider leading-none">
                  Số Dư Hiện Tại
                </span>
                <span className="text-sm font-black text-on-surface font-mono leading-tight">
                  {formatVipCoin(vipCoin)} VIP Coin
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Riot-Style Notice Banner */}
        <div className="my-space-md px-4 py-3 rounded-2xl bg-gradient-to-r from-tertiary/10 via-surface-container to-primary/10 border border-tertiary/30 flex items-center gap-4 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0">
            <Icon name="bolt" className="text-2xl" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-sm text-on-surface">
              Ưu đãi nạp xu PayOS tháng này
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Tất cả các gói nạp từ 50K trở lên đều được tặng thêm tới +30% VIP Coin miễn phí. Xu
              thưởng được cộng ngay lập tức vào ví sau khi giao dịch thành công.
            </p>
          </div>
        </div>

        {/* Content State: Loading, Error, or Bundles Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <span className="w-10 h-10 border-4 border-tertiary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-on-surface-variant font-medium">
              Đang tải danh sách gói nạp PayOS...
            </span>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-400">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bundles.map(bundle => {
              const isSelectedOrdering = orderingBundleId === bundle.id
              const hasBonus = bundle.bonusVipCoin > 0

              return (
                <div
                  key={bundle.id}
                  className={`group relative rounded-3xl bg-surface-container-low/90 backdrop-blur-xl border p-4 flex flex-col justify-between transition-all duration-300 hover:scale-[1.03] shadow-xl hover:shadow-2xl ${
                    hasBonus
                      ? 'border-tertiary/40 hover:border-tertiary'
                      : 'border-outline-variant/30 hover:border-primary/50'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-tertiary/20 text-tertiary border border-tertiary/30">
                      {bundle.badgeLabel || 'Gói nạp'}
                    </span>
                    {hasBonus && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                        +{bundle.bonusPercentage}% BONUS
                      </span>
                    )}
                  </div>

                  {/* Icon & VIP Coin Highlight */}
                  <div className="flex items-center gap-3 my-3">
                    <div className="relative w-12 h-12 shrink-0 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <span className="text-amber-400">
                        <Icon name="paid" className="text-2xl" />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-headline font-black text-2xl text-on-surface flex items-center gap-1.5">
                        <span className="font-mono text-tertiary">
                          {formatVipCoin(bundle.totalVipCoin)}
                        </span>
                        <span className="text-xs font-bold text-on-surface-variant uppercase">
                          VIP COIN
                        </span>
                      </h3>

                      {hasBonus && (
                        <p className="text-[11px] text-on-surface-variant">
                          Gốc {formatVipCoin(bundle.baseVipCoin)} +{' '}
                          <strong className="text-emerald-400">
                            {formatVipCoin(bundle.bonusVipCoin)} tặng
                          </strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Price and CTA */}
                  <div className="pt-3 border-t border-outline-variant/30 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant font-medium">Giá bán:</span>
                      <span className="font-headline font-black text-base text-on-surface">
                        {formatVnd(bundle.priceVnd)}
                      </span>
                    </div>

                    <Button
                      variant="gold"
                      size="md"
                      icon="credit_card"
                      loading={isSelectedOrdering}
                      onClick={() => handleSelectBundle(bundle)}
                      className="w-full"
                    >
                      {isSelectedOrdering ? 'Đang Chuyển Đến PayOS...' : 'Nạp Ngay'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Security & Support Guarantee */}
        <section className="mt-space-md grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="px-4 py-3 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Icon name="verified_user" className="text-xl" />
            </span>
            <div>
              <h5 className="font-headline font-bold text-xs text-on-surface">
                Thanh Toán Chuẩn VietQR
              </h5>
              <p className="text-[11px] text-on-surface-variant">
                Quét mã QR từ 40+ ứng dụng ngân hàng và ví Momo, ViettelMoney.
              </p>
            </div>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Icon name="bolt" className="text-xl" />
            </span>
            <div>
              <h5 className="font-headline font-bold text-xs text-on-surface">
                Tự Động Cộng Xu Tức Thì
              </h5>
              <p className="text-[11px] text-on-surface-variant">
                Webhook PayOS xử lý giao dịch tự động trong 1 - 3 giây.
              </p>
            </div>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0">
              <Icon name="headset_mic" className="text-xl" />
            </span>
            <div>
              <h5 className="font-headline font-bold text-xs text-on-surface">Hỗ Trợ 24/7</h5>
              <p className="text-[11px] text-on-surface-variant">
                Đội ngũ hỗ trợ kỹ thuật bài thủ mọi lúc khi gặp trục trặc giao dịch.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
