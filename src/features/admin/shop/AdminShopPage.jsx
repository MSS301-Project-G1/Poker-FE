import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon, Button } from '@/shared/ui'
import AdminSidebar from './components/AdminSidebar'
import ProductManagementTab from './components/ProductManagementTab'
import BundleManagementTab from './components/BundleManagementTab'
import { useAdminProducts } from './hooks/useAdminProducts'
import { useAdminBundles } from './hooks/useAdminBundles'

export default function AdminShopPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('PRODUCTS')

  // Products state & actions
  const {
    products,
    categories,
    loading: productsLoading,
    refreshProducts,
    createProduct,
    deleteProduct,
    uploadDeckSkinZip,
  } = useAdminProducts()

  // Bundles state & actions
  const {
    bundles,
    loading: bundlesLoading,
    refreshBundles,
    createBundle,
    toggleBundleActive,
  } = useAdminBundles()

  return (
    <div className="relative w-full min-h-screen pb-20 text-white font-body-md">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full px-4 md:px-8 xl:px-12 pt-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Icon name="admin_panel_settings" className="text-xl" />
            </span>
            <div>
              <h1 className="font-headline font-black text-xl md:text-2xl text-white">
                Cổng Quản Trị Hệ Thống Shop & Nạp Tiền
              </h1>
              <p className="text-xs text-white/50">Admin Management Portal • PayOS • S3 / MinIO Ingestion</p>
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

        {/* Admin Layout with Sidebar */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <AdminSidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            productCount={products.length}
            bundleCount={bundles.length}
          />

          <main className="flex-grow min-w-0 w-full">
            {activeTab === 'PRODUCTS' ? (
              <ProductManagementTab
                products={products}
                categories={categories}
                loading={productsLoading}
                createProduct={createProduct}
                deleteProduct={deleteProduct}
                uploadDeckSkinZip={uploadDeckSkinZip}
                onRefresh={refreshProducts}
              />
            ) : (
              <BundleManagementTab
                bundles={bundles}
                loading={bundlesLoading}
                toggleBundleActive={toggleBundleActive}
                createBundle={createBundle}
                onRefresh={refreshBundles}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
