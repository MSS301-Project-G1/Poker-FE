import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon, Button } from '@/shared/ui'
import { paths } from '@/shared/config/paths'
import ProductManagementTab from './components/ProductManagementTab'
import AddProductControlPanel from './components/AddProductControlPanel'
import BundleManagementTab from './components/BundleManagementTab'
import CategoryManagementTab from './components/CategoryManagementTab'
import { useAdminProducts } from './hooks/useAdminProducts'
import { useAdminBundles } from './hooks/useAdminBundles'

export default function AdminShopPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('PRODUCTS') // 'PRODUCTS' | 'ADD_PRODUCT' | 'CATEGORIES' | 'BUNDLES'
  const [editingProduct, setEditingProduct] = useState(null)

  // Products state & actions
  const {
    products,
    categories,
    loading: productsLoading,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalElements,
    selectedCategory,
    setSelectedCategory,
    selectedTier,
    setSelectedTier,
    selectedStatus,
    setSelectedStatus,
    refreshProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadDeckSkinZip,
    uploadDeckSkinFiles,
  } = useAdminProducts()

  // Bundles state & actions
  const {
    bundles,
    loading: bundlesLoading,
    refreshBundles,
    createBundle,
    updateBundle,
    deleteBundle,
    toggleBundleActive,
  } = useAdminBundles()

  return (
    <div className="relative w-full pb-32 text-white font-body-md">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full px-4 md:px-8 xl:px-12 pt-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-space-md mb-space-lg border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Icon name="admin_panel_settings" className="text-xl" />
            </span>
            <div>
              <h1 className="font-headline font-black text-xl md:text-2xl text-white">
                Cổng Quản Trị Hệ Thống Shop & Nạp Tiền
              </h1>
              <p className="text-xs text-white/50">Quản lý sản phẩm, danh mục, gói nạp và tài nguyên mỹ phẩm</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" icon="storefront" onClick={() => navigate('/shop')}>
              Xem Cửa Hàng
            </Button>
            <Button variant="secondary" size="sm" icon="home" onClick={() => navigate('/lobby')}>
              Sảnh Game
            </Button>
          </div>
        </div>

        {/* Tab Navigation for Shop Management */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={() => { setEditingProduct(null); setActiveTab('PRODUCTS') }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-action text-sm font-semibold transition-all ${
              activeTab === 'PRODUCTS'
                ? 'bg-primary-container text-on-primary-container shadow-md'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-white'
            }`}
          >
            <Icon name="inventory_2" />
            <span>Quản Lý Kho Hàng ({totalElements || products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setEditingProduct(null); setActiveTab('ADD_PRODUCT') }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-action text-sm font-semibold transition-all ${
              activeTab === 'ADD_PRODUCT'
                ? 'bg-primary-container text-on-primary-container shadow-md'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-white'
            }`}
          >
            <Icon name="add_circle" />
            <span>Thêm Vật Phẩm & Skin</span>
          </button>

          <button
            type="button"
            onClick={() => { setEditingProduct(null); setActiveTab('BUNDLES') }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-action text-sm font-semibold transition-all ${
              activeTab === 'BUNDLES'
                ? 'bg-primary-container text-on-primary-container shadow-md'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-white'
            }`}
          >
            <Icon name="payments" />
            <span>Gói Nạp VIP Coin ({bundles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setEditingProduct(null); setActiveTab('CATEGORIES') }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-action text-sm font-semibold transition-all ${
              activeTab === 'CATEGORIES'
                ? 'bg-primary-container text-on-primary-container shadow-md'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-white'
            }`}
          >
            <Icon name="category" />
            <span>Quản Lý Danh Mục</span>
          </button>
        </div>

        <section className="w-full">
          {activeTab === 'PRODUCTS' && (
            <ProductManagementTab
              products={products}
              categories={categories}
              loading={productsLoading}
              deleteProduct={deleteProduct}
              uploadDeckSkinZip={uploadDeckSkinZip}
              onRefresh={refreshProducts}
              page={page}
              setPage={setPage}
              size={size}
              setSize={setSize}
              totalPages={totalPages}
              totalElements={totalElements}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedTier={selectedTier}
              setSelectedTier={setSelectedTier}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              onOpenAddProduct={() => {
                setEditingProduct(null)
                setActiveTab('ADD_PRODUCT')
              }}
              onEditProduct={product => {
                navigate(paths.adminShopEditProduct(product.id))
              }}
            />
          )}

          {activeTab === 'ADD_PRODUCT' && (
            <AddProductControlPanel
              categories={categories}
              onRefreshCategories={refreshProducts}
              createProduct={createProduct}
              updateProduct={updateProduct}
              editingProduct={editingProduct}
              uploadDeckSkinZip={uploadDeckSkinZip}
              uploadDeckSkinFiles={uploadDeckSkinFiles}
              onSuccess={() => {
                setEditingProduct(null)
                refreshProducts()
                setActiveTab('PRODUCTS')
              }}
              onCancel={() => {
                setEditingProduct(null)
                setActiveTab('PRODUCTS')
              }}
            />
          )}

          {activeTab === 'CATEGORIES' && (
            <CategoryManagementTab
              onCategoryUpdated={refreshProducts}
            />
          )}

          {activeTab === 'BUNDLES' && (
            <BundleManagementTab
              bundles={bundles}
              loading={bundlesLoading}
              toggleBundleActive={toggleBundleActive}
              createBundle={createBundle}
              updateBundle={updateBundle}
              deleteBundle={deleteBundle}
              onRefresh={refreshBundles}
            />
          )}
        </section>
      </div>
    </div>
  )
}
