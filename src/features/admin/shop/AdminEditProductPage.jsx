import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Icon, Button, useToast } from '@/shared/ui'
import { paths } from '@/shared/config/paths'
import AddProductControlPanel from './components/AddProductControlPanel'
import {
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  maintainProduct,
  uploadDeckSkinZip,
  uploadDeckSkinFiles,
} from './services/adminShopService'

export default function AdminEditProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const notify = useToast()

  const isEditing = Boolean(id && id !== 'new')
  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSettingMaintain, setIsSettingMaintain] = useState(false)

  const handleQuickSetMaintain = async () => {
    if (!product?.id) return
    setIsSettingMaintain(true)
    try {
      await maintainProduct(product.id)
      setProduct(prev => ({ ...prev, status: 'MAINTAIN' }))
      notify(
        'Product suspended. You can edit it now.',
        { type: 'success' }
      )
    } catch (err) {
      notify(err.message || 'Couldn’t change the product status', { type: 'error' })
    } finally {
      setIsSettingMaintain(false)
    }
  }

  const handleUpdateProduct = async (productId, payload) => {
    if (product && product.status !== 'MAINTAIN') {
      notify(
        'Suspend the product before editing it.',
        { type: 'error' }
      )
      throw new Error('Suspend the product before editing it')
    }
    return updateProduct(productId, payload)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [catRes, prodRes] = await Promise.all([
        getCategories(),
        isEditing ? getProductById(id) : Promise.resolve(null),
      ])

      setCategories(catRes?.data || [])

      if (isEditing) {
        if (!prodRes?.data) {
          throw new Error('Product not found')
        }
        setProduct(prodRes.data)
      }
    } catch (err) {
      console.error('Failed to load edit product page data:', err)
      setError(err.message || 'Couldn’t load the product')
      notify(err.message || 'Error loading the product', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [id, isEditing, notify])

  useEffect(() => {
    void loadData()
  }, [loadData])

  return (
    <div className="relative w-full pb-32 text-white font-body-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Breadcrumb & Back Button */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon="arrow_back"
              onClick={() => navigate(paths.adminShop)}
              className="border-white/15 hover:bg-white/10"
            >
              Back to shop admin
            </Button>
            <div className="h-5 w-px bg-white/20" />
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span
                onClick={() => navigate(paths.adminShop)}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Shop admin
              </span>
              <Icon name="chevron_right" className="text-xs text-white/30" />
              <span className="text-white/80 font-bold">
                {isEditing ? `Edit: ${product?.name || id}` : 'New product'}
              </span>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="p-20 text-center rounded-2xl bg-surface-container-lowest/90 border border-white/10 shadow-raised space-y-4">
            <span className="w-12 h-12 border-3 border-tertiary border-t-transparent rounded-full animate-spin inline-block mx-auto" />
            <p className="text-sm font-bold text-white/70">
              Loading products and categories…
            </p>
          </div>
        ) : error ? (
          <div className="p-12 text-center rounded-2xl bg-error/10 border border-error/30 text-error space-y-4">
            <Icon name="error" className="text-4xl text-error" />
            <h3 className="text-base font-bold text-white">{error}</h3>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => navigate(paths.adminShop)}>
                Back to admin
              </Button>
              <Button variant="gold" size="sm" onClick={loadData}>
                Try again
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {isEditing && product && product.status !== 'MAINTAIN' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-tertiary/15 border border-tertiary/30 text-tertiary-fixed flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-raised animate-fade-in">
                <div className="flex items-center gap-3.5">
                  <span className="w-11 h-11 rounded-xl bg-tertiary/20 text-tertiary border border-tertiary/30 flex items-center justify-center shrink-0 shadow-md">
                    <Icon name="lock" className="text-2xl" />
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>This product is {product.status === 'ACTIVE' ? 'On sale (ACTIVE)' : product.status}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-error/20 text-error border border-error/30">
                        Can’t edit yet
                      </span>
                    </h4>
                    <p className="text-xs text-tertiary-fixed/80 mt-0.5">
                      To keep players’ items safe, the product must be <strong>Suspended</strong> before you can save changes.
                    </p>
                  </div>
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  loading={isSettingMaintain}
                  onClick={handleQuickSetMaintain}
                  icon="pause_circle"
                  className="shrink-0 font-bold"
                >
                  Suspend now
                </Button>
              </div>
            )}

            <AddProductControlPanel
              categories={categories}
              onRefreshCategories={loadData}
              createProduct={createProduct}
              updateProduct={handleUpdateProduct}
              editingProduct={product}
              uploadDeckSkinZip={uploadDeckSkinZip}
              uploadDeckSkinFiles={uploadDeckSkinFiles}
              onSuccess={() => {
                notify(
                  isEditing
                    ? `Updated “${product?.name || ''}”.`
                    : 'Product created.',
                  { type: 'success' }
                )
                navigate(paths.adminShop)
              }}
              onCancel={() => {
                navigate(paths.adminShop)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
