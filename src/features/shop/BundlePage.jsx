import { useState, useEffect, useRef, useMemo } from 'react'
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
  const [priceSort, setPriceSort] = useState('ASC') // 'ASC' | 'DESC'

  const sortedBundles = useMemo(() => {
    return [...bundles].sort((a, b) => {
      const priceA = Number(a.priceVnd) || 0
      const priceB = Number(b.priceVnd) || 0
      return priceSort === 'DESC' ? priceB - priceA : priceA - priceB
    })
  }, [bundles, priceSort])

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
          notify(`Order #${order.payosOrderCode} is complete. VIP Coin has been added to your wallet.`, {
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
      notify('Sign in to top up VIP Coin with PayOS.', { type: 'info' })
      navigate(paths.auth)
      return
    }

    // 1. Verify if user has an active pending order
    const currentPending = await checkPendingOrder()
    if (currentPending && currentPending.status === 'PENDING') {
      const synced = await syncPendingOrder()
      if (synced && synced.status === 'PAID') {
        notify(`Your previous order #${currentPending.payosOrderCode} was paid.`, {
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
      notify(err.message || 'Couldn’t create the PayOS order', { type: 'error' })
    }
  }

  // Conflict action: Cancel old order and purchase new bundle
  const handleCancelOldAndProceedNew = async () => {
    if (!conflictingBundle) return
    setIsCancellingOldOrder(true)
    try {
      await cancelPendingOrder()
      notify('Previous order cancelled. Switching to the new pack…', { type: 'info' })
      setIsConflictModalOpen(false)
      const targetBundle = conflictingBundle
      setConflictingBundle(null)
      await purchaseBundle(targetBundle.id)
    } catch (err) {
      notify(err.message || 'Couldn’t cancel the previous order', { type: 'error' })
    } finally {
      setIsCancellingOldOrder(false)
    }
  }

  return (
    <div className="relative w-full pb-space-lg overflow-hidden font-body-md min-h-screen">
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
              <span>Back to shop</span>
            </button>
            <div>
              <h1 className="font-headline font-bold text-3xl md:text-4xl text-on-surface tracking-tight">
                Top up VIP Coin
              </h1>
              <p className="text-sm text-on-surface-variant mt-1 font-medium">
                PayOS checkout · Scan VietQR · Instant top-up, 24/7
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isLoggedIn ? (
              /* Current Balance */
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-surface-container-high/90 border border-tertiary/40 shadow-raised">
                <span className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary shadow-md">
                  <Icon name="paid" className="text-xl" />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-tertiary leading-none">
                    Current balance
                  </span>
                  <span className="text-lg font-bold text-on-surface tabular-nums leading-tight">
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
                Sign in to top up
              </Button>
            )}
          </div>
        </div>

        {/* Riot-Style Promotion Notice Banner */}
        <div className="my-space-md p-5 rounded-2xl bg-tertiary/15 border border-tertiary/30 flex items-center gap-4 shadow-raised">
          <div className="w-12 h-12 rounded-2xl bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0 border border-tertiary/30 shadow-inner">
            <Icon name="bolt" className="text-3xl" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-base text-on-surface">
              This month’s PayOS top-up offer
            </h4>
            <p className="text-sm text-on-surface-variant leading-relaxed mt-0.5">
              Every pack from 50K up includes up to <strong className="text-tertiary font-bold">+30% VIP Coin</strong> as a free bonus. Bonus coins are added to your wallet as soon as payment succeeds.
            </p>
          </div>
        </div>

        {/* Sort & Filter Bar */}
        {!loading && !error && bundles.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary" />
              <span className="text-xs font-bold text-on-surface-variant">
                All available packs ({sortedBundles.length})
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-medium text-on-surface-variant">Sort by price:</span>
              <div className="inline-flex rounded-xl p-1 bg-surface-container-high/90 border border-outline-variant/30 shadow-inner">
                <button
                  type="button"
                  onClick={() => setPriceSort('ASC')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    priceSort === 'ASC'
                      ? 'bg-tertiary text-on-tertiary shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                  }`}
                  title="Sort by price, low to high"
                >
                  <Icon name="arrow_upward" className="text-xs" />
                  <span>Low → High</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriceSort('DESC')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    priceSort === 'DESC'
                      ? 'bg-tertiary text-on-tertiary shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                  }`}
                  title="Sort by price, high to low"
                >
                  <Icon name="arrow_downward" className="text-xs" />
                  <span>High → Low</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content State: Loading, Error, or Bundles Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <span className="w-12 h-12 border-4 border-tertiary border-t-transparent rounded-full animate-spin" />
            <span className="text-base text-on-surface-variant font-medium">
              Loading PayOS packs…
            </span>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-error text-lg">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedBundles.map(bundle => {
              const isSelectedOrdering = orderingBundleId === bundle.id
              const hasBonus = bundle.bonusVipCoin > 0

              return (
                <div
                  key={bundle.id}
                  className={`group relative rounded-2xl bg-surface-container-low/95 backdrop-blur-xl border p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-raised hover:shadow-2xl ${
                    hasBonus
                      ? 'border-tertiary/50 hover:border-tertiary '
                      : 'border-outline-variant/30 hover:border-primary/50'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-tertiary/20 text-tertiary border border-tertiary/30">
                      {bundle.badgeLabel || 'Coin pack'}
                    </span>
                    {hasBonus && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-error/20 text-error border border-error/30">
                        +{bundle.bonusPercentage}% bonus
                      </span>
                    )}
                  </div>

                  {/* Icon & VIP Coin Highlight */}
                  <div className="flex items-center gap-4 my-4">
                    <div className="relative w-14 h-14 shrink-0 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <span className="text-tertiary">
                        <Icon name="paid" className="text-3xl" />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-headline font-bold text-3xl md:text-4xl text-on-surface flex items-center gap-2">
                        <span className="tabular-nums text-tertiary tracking-tight">
                          {formatVipCoin(bundle.totalVipCoin)}
                        </span>
                        <span className="text-xs font-bold text-on-surface-variant">
                          VIP Coin
                        </span>
                      </h3>

                      {hasBonus && (
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Base {formatVipCoin(bundle.baseVipCoin)} +{' '}
                          <strong className="text-success font-bold">
                            {formatVipCoin(bundle.bonusVipCoin)} bonus
                          </strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Price and CTA */}
                  <div className="pt-4 border-t border-outline-variant/30 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-on-surface-variant font-medium">Price:</span>
                      <span className="font-headline font-bold text-xl md:text-2xl text-on-surface tabular-nums">
                        {formatVnd(bundle.priceVnd)}
                      </span>
                    </div>

                    <Button
                      variant="gold"
                      size="lg"
                      icon="credit_card"
                      loading={isSelectedOrdering}
                      onClick={() => handleSelectBundle(bundle)}
                      className="w-full text-base font-bold shadow-lg"
                    >
                      {isSelectedOrdering ? 'Redirecting to PayOS…' : 'Top up'}
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
            <span className="w-12 h-12 rounded-2xl bg-success/20 text-success flex items-center justify-center shrink-0 border border-success/30">
              <Icon name="verified_user" className="text-2xl" />
            </span>
            <div>
              <h5 className="font-headline font-bold text-sm text-on-surface">
                VietQR payments
              </h5>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Scan the QR code from 40+ banking apps and e-wallets such as MoMo and ViettelMoney.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center gap-4 shadow-md">
            <span className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30">
              <Icon name="bolt" className="text-2xl" />
            </span>
            <div>
              <h5 className="font-headline font-bold text-sm text-on-surface">
                Coins credited instantly
              </h5>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                A PayOS webhook verifies the payment and credits VIP Coin within 1–3 seconds.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center gap-4 shadow-md">
            <span className="w-12 h-12 rounded-2xl bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0 border border-tertiary/30">
              <Icon name="headset_mic" className="text-2xl" />
            </span>
            <div>
              <h5 className="font-headline font-bold text-sm text-on-surface">24/7 support</h5>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Every transaction is logged, so any issue can be reconciled.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Unfinished Order Pill (if modal was closed by user) */}
      {pendingOrder && !isPendingModalOpen && !isConflictModalOpen && (
        <aside
          aria-label="Order awaiting payment"
          className="fixed bottom-16 left-6 z-40 bg-surface-container-highest/95 border-2 border-tertiary/80 rounded-2xl p-4 shadow-raised backdrop-blur-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-300 max-w-sm sm:max-w-md"
        >
          <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0">
            <Icon name="pending_actions" className="text-2xl" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <div className="text-xs font-bold text-tertiary-fixed truncate">
              Order #{pendingOrder.payosOrderCode} pending
            </div>
            <div className="text-[11px] text-white/70 truncate">
              {pendingOrder.bundleName || 'Coin pack'} • {formatVnd(pendingOrder.amountVnd)}
            </div>
          </div>
          <Button
            variant="gold"
            size="sm"
            icon="qr_code_2"
            onClick={() => setIsPendingModalOpen(true)}
            className="shadow-md shrink-0"
          >
            Reopen QR
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-xl rounded-2xl bg-surface-container border-2 border-tertiary/40 p-6 md:p-8 shadow-raised text-left">
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-outline-variant/30">
              <div className="w-12 h-12 rounded-2xl bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0 border border-tertiary/30">
                <Icon name="pending_actions" className="text-3xl" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  Order awaiting payment
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  You have an unfinished payment
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
              <div className="p-4 rounded-2xl bg-surface-container-high/70 border border-tertiary/30">
                <span className="text-xs font-medium text-tertiary">
                  Pending order
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-sm text-on-surface">
                    #{pendingOrder.payosOrderCode} • {pendingOrder.bundleName || 'Coin pack'}
                  </span>
                  <span className="tabular-nums font-bold text-tertiary text-base">
                    {formatVnd(pendingOrder.amountVnd)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-high/70 border border-primary/30">
                <span className="text-xs font-medium text-primary">
                  Pack you selected
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-sm text-on-surface">
                    {conflictingBundle.name} ({formatVipCoin(conflictingBundle.totalVipCoin)} VIP Coin)
                  </span>
                  <span className="tabular-nums font-bold text-primary text-base">
                    {formatVnd(conflictingBundle.priceVnd)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Finish paying the previous order with VietQR, or cancel it and start a new payment for <strong>{conflictingBundle.name}</strong>?
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
                className="w-full text-sm font-bold shadow-lg py-3"
              >
                Continue previous order (#{pendingOrder.payosOrderCode})
              </Button>

              <Button
                variant="secondary"
                size="md"
                icon="swap_horiz"
                loading={isCancellingOldOrder}
                onClick={handleCancelOldAndProceedNew}
                className="w-full text-sm font-bold border border-error/40 text-error hover:bg-error/10 py-3"
              >
                Cancel it and buy the new pack ({conflictingBundle.name})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

