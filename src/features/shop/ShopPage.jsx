import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon, useToast } from '@/shared/ui'
import ShopSidebar from './components/ShopSidebar'
import FeaturedBundle from './components/FeaturedBundle'
import ProductCard from './components/ProductCard'
import InventoryGrid from './components/InventoryGrid'
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
  const [searchParams] = useSearchParams()
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
      notify(`Chúc mừng! Bạn đã sở hữu "${product.name}".`, { type: 'success' })
      await Promise.all([refreshWallet(), refreshInventory()])
    },
  })

  // Switch to wallet tab if requested via URL param (e.g. from payment success page)
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'wallet') {
      setActiveCategory('MY_WALLET')
    }
  }, [searchParams, setActiveCategory])

  // Equip handler for owned items
  const handleEquipProduct = async product => {
    if (!isLoggedIn) {
      notify('Vui lòng đăng nhập để thực hiện thao tác này.', { type: 'info' })
      navigate(paths.auth)
      return
    }
    try {
      await equipItem(product.id)
      await refreshInventory()
      notify(`Đã trang bị "${product.name}".`, { type: 'success' })
    } catch (err) {
      notify(err.message || 'Không thể trang bị vật phẩm', { type: 'error' })
    }
  }

  // Buy click handler: Redirect guest to login
  const handleBuyProduct = product => {
    if (!isLoggedIn) {
      notify('Vui lòng đăng nhập để mua vật phẩm này.', { type: 'info' })
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
      notify(err.message || 'Giao dịch mua vật phẩm thất bại', { type: 'error' })
    }
  }


  const handleSelectCategory = useCallback(categoryCode => {
    setActiveCategory(categoryCode)
  }, [setActiveCategory])

  return (
    <div className={styles.pageWrapper}>
      {/* Background ambient lighting */}
      <div className={styles.ambientGlowPrimary} />
      <div className={styles.ambientGlowSecondary} />

      {/* Fluid Widescreen Container */}
      <div className={styles.container}>
        {/* Top Bar: VIP Coin Balance / Guest Sign-in */}
        <div className={styles.topBar}>
          <div className={styles.pageHeading}>
            <h1 className={styles.pageTitle}>Cửa Hàng Vật Phẩm & Skin</h1>
          </div>

          <div className={styles.topBarActions}>
            {isLoggedIn ? (
              <>
                {/* VIP Coin Pill - Click to open wallet tab */}
                <div
                  className={styles.vipCoinPill}
                  onClick={() => handleSelectCategory('MY_WALLET')}
                  title="Nhấn để xem chi tiết ví và lịch sử biến động số dư"
                  role="button"
                  tabIndex={0}
                >
                  <span className={styles.coinIcon}>
                    <Icon name="paid" />
                  </span>
                  <div className={styles.coinTextCol}>
                    <span className={styles.coinLabel}>Số dư VIP Coin (Xem ví)</span>
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
                  Nạp VIP Coin
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70">
                  <Icon name="visibility" className="text-sm text-amber-400" />
                  <span>Chế độ xem khách</span>
                </span>
                <Button
                  variant="gold"
                  size="sm"
                  icon="login"
                  onClick={() => navigate(paths.auth)}
                >
                  Đăng nhập
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
            {activeCategory === 'MY_INVENTORY' ? (
              !isLoggedIn ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl my-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-400/10">
                    <Icon name="lock" className="text-3xl" />
                  </div>
                  <h3 className="font-headline font-bold text-2xl text-white mb-2">
                    Túi Đồ Trang Trí Cá Nhân
                  </h3>
                  <p className="text-sm text-white/60 max-w-md mb-6 leading-relaxed">
                    Bạn đang ở chế độ xem khách. Vui lòng đăng nhập tài khoản để quản lý, xem lịch sử và kích hoạt trang bị các mặt bài, bàn chơi và avatar của bạn.
                  </p>
                  <Button
                    variant="gold"
                    size="md"
                    icon="login"
                    onClick={() => navigate(paths.auth)}
                  >
                    Đăng Nhập Ngay
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-headline font-bold text-xl text-white">
                        Túi Đồ Trang Trí Của Bạn
                      </h3>
                      <p className="text-xs text-white/60">
                        Quản lý và kích hoạt các mặt bài, bàn chơi và avatar bạn đã sở hữu.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => refreshInventory()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-xs font-semibold hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <Icon name="refresh" className="text-sm" /> Làm mới
                    </button>
                  </div>

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
                    <span>Danh Mục Sản Phẩm</span>
                  </h3>
                  <span className={styles.itemCount}>{products.length} vật phẩm</span>
                </div>

                {/* Products Grid */}
                {catalogLoading ? (
                  <div className={styles.loadingState}>
                    <span className={styles.spinner} />
                    <span className={styles.loadingText}>Đang nạp dữ liệu từ máy chủ...</span>
                  </div>
                ) : catalogError ? (
                  <div className={styles.errorState}>
                    <p>{catalogError}</p>
                    <button
                      type="button"
                      onClick={() => refreshCatalog()}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/20"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : products.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>Không tìm thấy vật phẩm nào trong mục này.</p>
                  </div>
                ) : (
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
