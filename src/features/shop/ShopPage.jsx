import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon, useToast } from '@/shared/ui'
import ShopSidebar from './components/ShopSidebar'
import FeaturedBundle from './components/FeaturedBundle'
import ProductCard from './components/ProductCard'
import InventoryGrid from './components/InventoryGrid'
import ConfirmPurchaseModal from './components/ConfirmPurchaseModal'
import DevAccountSwitcher from './components/DevAccountSwitcher'
import { Button } from './shared/ui'
import { useShopCatalog } from './hooks/useShopCatalog'
import { useWallet } from './hooks/useWallet'
import { useInventory } from './hooks/useInventory'
import { formatVipCoin } from './utils/shopFormatters'
import styles from './ShopPage.module.css'

export default function ShopPage() {
  const navigate = useNavigate()
  const notify = useToast()
  const [purchaseModalProduct, setPurchaseModalProduct] = useState(null)

  // 1. User Wallet (VIP Coin & Coin)
  const { vipCoin, refreshWallet } = useWallet()

  // 2. User Inventory & Equip/Unequip state
  const {
    items: inventoryItems,
    ownedProductIds,
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

  // Equip handler for owned items
  const handleEquipProduct = async product => {
    try {
      await equipItem(product.id)
      notify(`Đã trang bị "${product.name}".`, { type: 'success' })
    } catch (err) {
      notify(err.message || 'Không thể trang bị vật phẩm', { type: 'error' })
    }
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

  const isProductEquipped = productId => {
    const invItem = inventoryItems.find(i => i.productId === productId)
    return Boolean(invItem?.isEquipped)
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Background ambient lighting */}
      <div className={styles.ambientGlowPrimary} />
      <div className={styles.ambientGlowSecondary} />

      {/* Fluid Widescreen Container */}
      <div className={styles.container}>
        {/* Top Bar: Dev Switcher, VIP Coin Balance & Top Up */}
        <div className={styles.topBar}>
          <div className={styles.pageHeading}>
            <h1 className={styles.pageTitle}>Cửa Hàng Vật Phẩm & Skin</h1>
          </div>

          <div className={styles.topBarActions}>
            <DevAccountSwitcher />

            {/* VIP Coin Pill */}
            <div className={styles.vipCoinPill}>
              <span className={styles.coinIcon}>
                <Icon name="paid" />
              </span>
              <div className={styles.coinTextCol}>
                <span className={styles.coinLabel}>Số dư VIP Coin</span>
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
          </div>
        </div>

        {/* Main Layout: Fixed/Toggleable Sidebar + Adaptive Fluid Content */}
        <div className={styles.mainLayout}>
          <ShopSidebar
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            inventoryCount={inventoryItems.length}
          />

          {/* Right Main Content */}
          <main className={styles.contentArea}>
            {activeCategory === 'MY_INVENTORY' ? (
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
                        isEquipping={actionInProgressId !== null}
                        onSelect={() => navigate(`/shop/products/${product.id}`)}
                        onBuy={p => setPurchaseModalProduct(p)}
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
