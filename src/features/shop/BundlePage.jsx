import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon, useToast } from '@/shared/ui'
import { Button } from './shared/ui'
import { useBundleTopup } from './hooks/useBundleTopup'
import { useWallet } from './hooks/useWallet'
import { usePendingOrder } from './hooks/usePendingOrder'
import { formatVipCoin, formatVnd } from './utils/shopFormatters'
import PendingPaymentModal from './components/PendingPaymentModal/PendingPaymentModal'

export default function BundlePage() {
  const navigate = useNavigate()
  const notify = useToast()
  const { bundles, loading, error, orderingBundleId, purchaseBundle, clearOrderingState } = useBundleTopup()
  const { vipCoin, isLoggedIn, refreshWallet } = useWallet()
  const { pendingOrder, cancelPendingOrder, syncPendingOrder, checkPendingOrder } = usePendingOrder()

  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false)
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false)
  const [conflictingBundle, setConflictingBundle] = useState(null)
  const [isCancellingOldOrder, setIsCancellingOldOrder] = useState(false)

  const hasAutoPromptedRef = useRef(false)

  // Auto-detect rollback or returning to page with an active pending order
  useEffect(() => {
    let disposed = false

    const checkAndPrompt = async () => {
      clearOrderingState?.()
      const order = await checkPendingOrder()
      if (disposed) return
      if (order && order.status === 'PENDING') {
        // Sync with PayOS to verify if user completed payment before coming back
        const synced = await syncPendingOrder(order.id)
        if (disposed) return
        if (synced && synced.status === 'PAID') {
          notify(`Giao dịch đơn hàng #${order.payosOrderCode} đã hoàn tất! Đã cộng VIP Coin vào ví.`, {
            type: 'success',
          })
          refreshWallet()
        } else if (!hasAutoPromptedRef.current) {
          hasAutoPromptedRef.current = true
          setIsPendingModalOpen(true)
        }
      }
    }

    void checkAndPrompt()

    const handleWindowFocus = () => {
      void checkAndPrompt()
    }
    window.addEventListener('pageshow', handleWindowFocus)
    window.addEventListener('focus', handleWindowFocus)
    return () => {
      disposed = true
      window.removeEventListener('pageshow', handleWindowFocus)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [checkPendingOrder, syncPendingOrder, refreshWallet, notify, clearOrderingState])


  // Select bundle handler: checks existing pending order before proceeding
  const handleSelectBundle = async bundle => {
    if (!isLoggedIn) {
      notify('Vui lòng đăng nhập để nạp VIP Coin qua PayOS.', { type: 'info' })
      navigate(paths.auth)
      return
    }

    // 1. Verify if user has an active pending order
    const currentPending = await checkPendingOrder()
    if (currentPending && currentPending.status === 'PENDING') {
      const synced = await syncPendingOrder()
      if (synced && synced.status === 'PAID') {
        notify(`Đơn hàng trước đó #${currentPending.payosOrderCode} đã thanh toán thành công!`, {
          type: 'success',
        })
        await refreshWallet()
      } else {
        // Still pending: check if it's the exact same bundle
        if (currentPending.bundleId === bundle.id) {
          setIsPendingModalOpen(true)
          return
        }

        // Different bundle: pop up Conflict Confirmation Modal!
        setConflictingBundle(bundle)
        setIsConflictModalOpen(true)
        return
      }
    }

    // 2. No pending order conflict, proceed with direct checkout
    try {
      await purchaseBundle(bundle.id)
    } catch (err) {
      notify(err.message || 'Không thể tạo đơn hàng thanh toán PayOS', { type: 'error' })
    }
  }

  // Conflict action: Cancel old order and purchase new bundle
  const handleCancelOldAndProceedNew = async () => {
    if (!conflictingBundle) return
    setIsCancellingOldOrder(true)
    try {
      await cancelPendingOrder()
      notify('Đã hủy đơn hàng cũ. Đang chuyển sang gói mới...', { type: 'info' })
      setIsConflictModalOpen(false)
      const targetBundle = conflictingBundle
      setConflictingBundle(null)
      await purchaseBundle(targetBundle.id)
    } catch (err) {
      notify(err.message || 'Không thể hủy đơn cũ để tạo gói mới', { type: 'error' })
    } finally {
      setIsCancellingOldOrder(false)
    }
  }

  return (
    <div className="relative w-full pb-space-lg overflow-hidden font-body-md min-h-screen">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 right-10 w-[550px] h-[550px] bg-tertiary/15 rounded-full blur-[160px]" />
        <div className="absolute -bottom-20 left-10 w-[700px] h-[500px] bg-secondary-container/20 rounded-full blur-[160px]" />
      </div>

      {/* Fluid wide container for large/wide displays */}
      <div className="w-full max-w-[1700px] mx-auto px-6 md:px-12 pt-space-lg">
        {/* Top Navigation & Balance Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-space-md border-b border-outline-variant/30">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high/80 text-on-surface hover:bg-surface-container-highest transition-all text-sm font-bold border border-outline-variant/30 shadow-sm"
            >
              <Icon name="arrow_back" className="text-base" />
              <span>Quay Lại Cửa Hàng</span>
            </button>
            <div>
              <h1 className="font-headline font-black text-3xl md:text-4xl text-on-surface tracking-tight">
                Nạp VIP Coin
              </h1>
              <p className="text-sm text-on-surface-variant mt-1 font-medium">
                Cổng thanh toán tự động PayOS • Quét mã VietQR • Nạp tức thì 24/7
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isLoggedIn ? (
              /* Current Balance */
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-surface-container-high/90 border border-tertiary/40 shadow-xl">
                <span className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shadow-md">
                  <Icon name="paid" className="text-xl" />
                </span>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase font-black text-tertiary tracking-wider leading-none">
                    Số Dư Hiện Tại
                  </span>
                  <span className="text-lg font-black text-on-surface font-mono leading-tight">
                    {formatVipCoin(vipCoin)} VIP Coin
                  </span>
                </div>
              </div>
            ) : (
              <Button
                variant="gold"
                size="md"
                icon="login"
                onClick={() => navigate(paths.auth)}
              >
                Đăng nhập để nạp
              </Button>
            )}
          </div>
        </div>

        {/* Riot-Style Promotion Notice Banner */}
        <div className="my-space-md p-5 rounded-2xl bg-gradient-to-r from-tertiary/15 via-surface-container to-primary/15 border border-tertiary/30 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0 border border-tertiary/30 shadow-inner">
            <Icon name="bolt" className="text-3xl" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-base text-on-surface">
              Ưu đãi nạp xu PayOS tháng này
            </h4>
            <p className="text-sm text-on-surface-variant leading-relaxed mt-0.5">
              Tất cả các gói nạp từ 50K trở lên đều được tặng thêm tới <strong className="text-tertiary font-bold">+30% VIP Coin</strong> miễn phí. Xu
              thưởng được cộng ngay lập tức vào ví sau khi giao dịch thành công.
            </p>
          </div>
        </div>

        {/* Content State: Loading, Error, or Bundles Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <span className="w-12 h-12 border-4 border-tertiary border-t-transparent rounded-full animate-spin" />
            <span className="text-base text-on-surface-variant font-medium">
              Đang tải danh sách gói nạp PayOS...
            </span>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-400 text-lg">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bundles.map(bundle => {
              const isSelectedOrdering = orderingBundleId === bundle.id
              const hasBonus = bundle.bonusVipCoin > 0

              return (
                <div
                  key={bundle.id}
                  className={`group relative rounded-3xl bg-surface-container-low/95 backdrop-blur-xl border p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl ${
                    hasBonus
                      ? 'border-tertiary/50 hover:border-tertiary shadow-tertiary/5'
                      : 'border-outline-variant/30 hover:border-primary/50'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-tertiary/20 text-tertiary border border-tertiary/30">
                      {bundle.badgeLabel || 'Gói nạp'}
                    </span>
                    {hasBonus && (
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                        +{bundle.bonusPercentage}% BONUS
                      </span>
                    )}
                  </div>

                  {/* Icon & VIP Coin Highlight */}
                  <div className="flex items-center gap-4 my-4">
                    <div className="relative w-14 h-14 shrink-0 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <span className="text-amber-400">
                        <Icon name="paid" className="text-3xl" />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-headline font-black text-3xl md:text-4xl text-on-surface flex items-center gap-2">
                        <span className="font-mono text-tertiary tracking-tight">
                          {formatVipCoin(bundle.totalVipCoin)}
                        </span>
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          VIP COIN
                        </span>
                      </h3>

                      {hasBonus && (
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Gốc {formatVipCoin(bundle.baseVipCoin)} +{' '}
                          <strong className="text-emerald-400 font-bold">
                            {formatVipCoin(bundle.bonusVipCoin)} tặng
                          </strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Price and CTA */}
                  <div className="pt-4 border-t border-outline-variant/30 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-on-surface-variant font-medium">Giá thanh toán:</span>
                      <span className="font-headline font-black text-xl md:text-2xl text-on-surface font-mono">
                        {formatVnd(bundle.priceVnd)}
                      </span>
                    </div>

                    <Button
                      variant="gold"
                      size="lg"
                      icon="credit_card"
                      loading={isSelectedOrdering}
                      onClick={() => handleSelectBundle(bundle)}
                      className="w-full text-base font-bold shadow-lg shadow-amber-500/10"
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
        <section className="mt-space-lg grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center gap-4 shadow-md">
            <span className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Icon name="verified_user" className="text-2xl" />
            </span>
            <div>
              <h5 className="font-headline font-bold text-sm text-on-surface">
                Thanh Toán Chuẩn VietQR
              </h5>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Quét mã QR từ 40+ ứng dụng ngân hàng và ví điện tử MoMo, ViettelMoney.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center gap-4 shadow-md">
            <span className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30">
              <Icon name="bolt" className="text-2xl" />
            </span>
            <div>
              <h5 className="font-headline font-bold text-sm text-on-surface">
                Tự Động Cộng Xu Tức Thì
              </h5>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Webhook PayOS xác thực và tự động cộng VIP Coin vào ví trong 1 - 3 giây.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center gap-4 shadow-md">
            <span className="w-12 h-12 rounded-2xl bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0 border border-tertiary/30">
              <Icon name="headset_mic" className="text-2xl" />
            </span>
            <div>
              <h5 className="font-headline font-bold text-sm text-on-surface">Hỗ Trợ 24/7</h5>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Hệ thống lưu vết giao dịch minh bạch, hỗ trợ đối soát mọi lúc khi gặp trục trặc.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Unfinished Order Pill (if modal was closed by user) */}
      {pendingOrder && !isPendingModalOpen && !isConflictModalOpen && (
        <aside
          aria-label="Đơn hàng đang chờ thanh toán"
          className="fixed bottom-16 left-6 z-40 bg-surface-container-highest/95 border-2 border-amber-400/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-300 max-w-sm sm:max-w-md"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
            <Icon name="pending_actions" className="text-2xl animate-pulse" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <div className="text-xs font-bold text-amber-300 truncate">
              Đơn hàng #{pendingOrder.payosOrderCode} đang chờ
            </div>
            <div className="text-[11px] text-white/70 truncate">
              {pendingOrder.bundleName || 'Gói nạp'} • {formatVnd(pendingOrder.amountVnd)}
            </div>
          </div>
          <Button
            variant="gold"
            size="sm"
            icon="qr_code_2"
            onClick={() => setIsPendingModalOpen(true)}
            className="shadow-md shrink-0"
          >
            Mở Lại QR
          </Button>
        </aside>
      )}

      {/* Modal 1: Chi Tiết / Quét Mã Thanh Toán VietQR / PayOS */}
      <PendingPaymentModal
        order={pendingOrder}
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        onCancelOrder={cancelPendingOrder}
        onSyncOrder={syncPendingOrder}
        onSuccess={async () => {
          await refreshWallet()
          await checkPendingOrder()
        }}
      />

      {/* Modal 2: Conflict Switch Modal (Khi user chọn gói mới trong khi đơn cũ chưa thanh toán) */}
      {isConflictModalOpen && pendingOrder && conflictingBundle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-xl rounded-3xl bg-surface-container border-2 border-amber-500/40 p-6 md:p-8 shadow-2xl shadow-amber-500/10 text-left">
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-outline-variant/30">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Icon name="pending_actions" className="text-3xl animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-headline font-black text-xl text-on-surface">
                  Đơn Hàng Đang Chờ Thanh Toán
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Phát hiện giao dịch trước đó chưa hoàn tất
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConflictModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>

            {/* Comparison Details */}
            <div className="my-5 flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-surface-container-high/70 border border-amber-500/30">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  Đơn Hàng Hiện Tại Đang Chờ
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-sm text-on-surface">
                    #{pendingOrder.payosOrderCode} • {pendingOrder.bundleName || 'Gói nạp'}
                  </span>
                  <span className="font-mono font-black text-amber-400 text-base">
                    {formatVnd(pendingOrder.amountVnd)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-high/70 border border-primary/30">
                <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                  Gói Mới Bạn Vừa Chọn
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-sm text-on-surface">
                    {conflictingBundle.name} ({formatVipCoin(conflictingBundle.totalVipCoin)} VIP Coin)
                  </span>
                  <span className="font-mono font-black text-primary text-base">
                    {formatVnd(conflictingBundle.priceVnd)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Bạn muốn tiếp tục hoàn tất thanh toán đơn hàng cũ qua VietQR, hay hủy đơn cũ để tạo phiên thanh toán mới cho gói <strong>{conflictingBundle.name}</strong>?
              </p>
            </div>

            {/* Actions: Full-width stacked buttons eliminate horizontal overflow and improve mobile ergonomics */}
            <div className="flex flex-col gap-3 pt-2 w-full">
              <Button
                variant="gold"
                size="md"
                icon="qr_code_2"
                onClick={() => {
                  setIsConflictModalOpen(false)
                  setIsPendingModalOpen(true)
                }}
                className="w-full text-sm font-bold shadow-lg shadow-amber-500/20 py-3"
              >
                Tiếp Tục Thanh Toán Đơn Cũ (#{pendingOrder.payosOrderCode})
              </Button>

              <Button
                variant="secondary"
                size="md"
                icon="swap_horiz"
                loading={isCancellingOldOrder}
                onClick={handleCancelOldAndProceedNew}
                className="w-full text-sm font-bold border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 py-3"
              >
                Hủy Đơn Cũ & Mua Gói Mới ({conflictingBundle.name})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

