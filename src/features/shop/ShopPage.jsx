import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon, useToast } from '@/shared/ui'
import ShopSidebar from './components/ShopSidebar'
import FeaturedBundle from './components/FeaturedBundle'
import ProductCard from './components/ProductCard'
import InventoryGrid from './components/InventoryGrid'
import DeletingProductsBanner from './components/DeletingProductsBanner'
import WalletOverviewTab from './components/WalletOverviewTab'
import ConfirmPurchaseModal from './components/ConfirmPurchaseModal'
import { Button } from './shared/ui'
import { useShopCatalog } from './hooks/useShopCatalog'
import { useWallet } from './hooks/useWallet'
import { useInventory } from './hooks/useInventory'
import { formatVipCoin } from './utils/shopFormatters'
import styles from './ShopPage.module.css'

export default function ShopPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const notify = useToast()
  const [purchaseModalProduct, setPurchaseModalProduct] = useState(null)

  // 1. User Wallet (VIP Coin & Coin & Login State)
  const { wallet, isLoggedIn, vipCoin, refreshWallet } = useWallet()

  // 2. User Inventory & Equip/Unequip state
  const {
    items: inventoryItems,
    ownedProductIds,
    isProductEquipped,
    loading: inventoryLoading,
    actionInProgressId,
    equipItem,
    unequipItem,
    refreshInventory,
  } = useInventory()

  // 3. Shop Catalog & Purchase
  const {
    categories,
    products,
    page,
    setPage,
    totalPages,
    totalElements,
    activeCategory,
    setActiveCategory,
    loading: catalogLoading,
    error: catalogError,
    isPurchasing,
    refreshCatalog,
    purchaseProduct,
  } = useShopCatalog({
    ownedProductIds,
    onPurchaseSuccess: async product => {
      notify(`You now own “${product.name}”.`, { type: 'success' })
      await Promise.all([refreshWallet(), refreshInventory()])
    },
  })

  // Synchronize URL search params with active category / tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    const cat = searchParams.get('category')
    if (tab === 'wallet') {
      setActiveCategory('MY_WALLET')
    } else if (tab === 'inventory') {
      setActiveCategory('MY_INVENTORY')
    } else if (cat) {
      setActiveCategory(cat)
    } else {
      setActiveCategory('ALL')
    }
  }, [searchParams, setActiveCategory])

  // Equip handler for owned items
  const handleEquipProduct = async product => {
    if (!isLoggedIn) {
      notify('Sign in to do this.', { type: 'info' })
      navigate(paths.auth)
      return
    }
    try {
      await equipItem(product.id)
      await refreshInventory()
      notify(`Equipped “${product.name}”.`, { type: 'success' })
    } catch (err) {
      notify(err.message || 'Couldn’t equip the item', { type: 'error' })
    }
  }

  // Buy click handler: Redirect guest to login
  const handleBuyProduct = product => {
    if (!isLoggedIn) {
      notify('Sign in to buy this item.', { type: 'info' })
      navigate(paths.auth)
      return
    }
    setPurchaseModalProduct(product)
  }

  // Handle purchase confirmation from modal
  const handleConfirmPurchase = async () => {
    if (!purchaseModalProduct) return
    try {
      await purchaseProduct(purchaseModalProduct)
      setPurchaseModalProduct(null)
    } catch (err) {
      notify(err.message || 'Purchase failed', { type: 'error' })
    }
  }

  const handleSelectCategory = useCallback(categoryCode => {
    setActiveCategory(categoryCode)
    if (categoryCode === 'MY_WALLET') {
      setSearchParams({ tab: 'wallet' }, { replace: true })
    } else if (categoryCode === 'MY_INVENTORY') {
      setSearchParams({ tab: 'inventory' }, { replace: true })
    } else if (categoryCode === 'ALL') {
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ category: categoryCode }, { replace: true })
    }
  }, [setActiveCategory, setSearchParams])

  return (
    <div className={styles.pageWrapper}>

      {/* Fluid Widescreen Container */}
      <div className={styles.container}>
        {/* Top Bar: VIP Coin Balance / Guest Sign-in */}
        <div className={styles.topBar}>
          <div className={styles.pageHeading}>
            <h1 className={styles.pageTitle}>Shop</h1>
          </div>

          <div className={styles.topBarActions}>
            {isLoggedIn ? (
              <>
                {/* VIP Coin Pill - Click to open wallet tab */}
                <div
                  className={styles.vipCoinPill}
                  onClick={() => handleSelectCategory('MY_WALLET')}
                  title="Open wallet and balance history"
                  role="button"
                  tabIndex={0}
                >
                  <span className={styles.coinIcon}>
                    <Icon name="paid" />
                  </span>
                  <div className={styles.coinTextCol}>
                    <span className={styles.coinLabel}>VIP Coin balance</span>
                    <span className={styles.coinValue}>{formatVipCoin(vipCoin)}</span>
                  </div>
                </div>

                {/* Top Up CTA */}
                <Button
                  variant="gold"
                  size="sm"
                  icon="add_circle"
                  onClick={() => navigate('/shop/bundles')}
                >
                  Top up VIP Coin
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70">
                  <Icon name="visibility" className="text-sm text-tertiary" />
                  <span>Guest view</span>
                </span>
                <Button
                  variant="gold"
                  size="sm"
                  icon="login"
                  onClick={() => navigate(paths.auth)}
                >
                  Sign in
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Layout: Fixed/Toggleable Sidebar + Adaptive Fluid Content */}
        <div className={styles.mainLayout}>
          <ShopSidebar
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            inventoryCount={inventoryItems.length}
            isLoggedIn={isLoggedIn}
          />

          {/* Right Main Content */}
          <main className={styles.contentArea}>
            <DeletingProductsBanner />
            {activeCategory === 'MY_INVENTORY' ? (
              !isLoggedIn ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl my-4">
                  <div className="w-16 h-16 rounded-2xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary mb-4 shadow-lg shadow-tertiary/10">
                    <Icon name="lock" className="text-3xl" />
                  </div>
                  <h3 className="font-headline font-bold text-2xl text-white mb-2">
                    Your inventory
                  </h3>
                  <p className="text-sm text-white/60 max-w-md mb-6 leading-relaxed">
                    You’re browsing as a guest. Sign in to manage and equip your card skins, tables and avatars.
                  </p>
                  <Button
                    variant="gold"
                    size="md"
                    icon="login"
                    onClick={() => navigate(paths.auth)}
                  >
                    Sign in
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="font-headline font-bold text-xl text-white">
                        Your inventory
                      </h3>
                      <p className="text-xs text-white/60">
                        Manage and equip your card skins, dealers, coins and tables.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => refreshInventory()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 text-xs font-semibold hover:bg-white/10 transition-colors border border-white/10 self-start sm:self-auto text-white/80 hover:text-white"
                    >
                      <Icon name="refresh" className="text-sm" /> Refresh inventory
                    </button>
                  </div>

                  {/* Banner thông báo các vật phẩm trong kho đang tạm ngưng phục vụ */}
                  {inventoryItems.some(i => i.productStatus === 'MAINTAIN' || i.isDeleting) && (
                    <div className="p-4 rounded-2xl bg-tertiary/15 border border-tertiary/30 flex items-start gap-3.5 mb-6 text-tertiary-fixed shadow-xl">
                      <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0 border border-tertiary/30 shadow-md">
                        <Icon name="pause_circle" className="text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-headline font-bold text-sm text-white">
                            Suspended items
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-tertiary text-on-tertiary uppercase tracking-wider">
                            Can’t be equipped
                          </span>
                        </div>
                        <p className="text-xs text-tertiary-fixed/90 leading-relaxed">
                          These items in your inventory are suspended for maintenance:
                          {' '}
                          <strong className="text-white underline font-semibold">
                            {inventoryItems
                              .filter(i => i.productStatus === 'MAINTAIN' || i.isDeleting)
                              .map(i => i.productName)
                              .join(', ')}
                          </strong>. You still own them, but they can’t be equipped until they’re back.
                        </p>
                      </div>
                    </div>
                  )}

                  <InventoryGrid
                    items={inventoryItems}
                    loading={inventoryLoading}
                    actionInProgressId={actionInProgressId}
                    onEquip={equipItem}
                    onUnequip={unequipItem}
                    onSelectProduct={item => {
                      if (item.productId) navigate(`/shop/products/${item.productId}`)
                    }}
                  />
                </div>
              )
            ) : activeCategory === 'MY_WALLET' ? (
              <WalletOverviewTab
                wallet={wallet}
                isLoggedIn={isLoggedIn}
                onRefreshWallet={refreshWallet}
              />
            ) : (
              <>
                {/* Featured Promo Banner */}
                <FeaturedBundle />

                {/* Catalog Header & Count */}
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>
                    <Icon name="storefront" className={styles.titleIcon} />
                    <span>Products</span>
                  </h3>
                  <span className={styles.itemCount}>{products.length} items</span>
                </div>

                {/* Products Grid */}
                {catalogLoading ? (
                  <div className={styles.loadingState}>
                    <span className={styles.spinner} />
                    <span className={styles.loadingText}>Loading…</span>
                  </div>
                ) : catalogError ? (
                  <div className={styles.errorState}>
                    <p>{catalogError}</p>
                    <button
                      type="button"
                      onClick={() => refreshCatalog()}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/20"
                    >
                      Try again
                    </button>
                  </div>
                ) : products.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No items in this category.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={styles.productsGrid}>
                      {products.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isEquipped={isProductEquipped(product.id)}
                          isEquipping={actionInProgressId === product.id}
                          onSelect={() => navigate(`/shop/products/${product.id}`)}
                          onBuy={handleBuyProduct}
                          onEquip={handleEquipProduct}
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-6 pb-2">
                        <button
                          type="button"
                          disabled={page <= 0}
                          onClick={() => setPage(p => Math.max(0, p - 1))}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold"
                        >
                          <Icon name="chevron_left" className="text-base" />
                          <span>Previous</span>
                        </button>
                        <span className="text-xs text-white/60 px-3">
                          Page <strong className="text-white font-bold">{page + 1}</strong> / {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={page >= totalPages - 1}
                          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold"
                        >
                          <span>Next</span>
                          <Icon name="chevron_right" className="text-base" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmPurchaseModal
        isOpen={Boolean(purchaseModalProduct)}
        product={purchaseModalProduct}
        currentVipCoin={vipCoin}
        isPurchasing={isPurchasing}
        onConfirm={handleConfirmPurchase}
        onClose={() => setPurchaseModalProduct(null)}
      />
    </div>
  )
}
