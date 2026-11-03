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
        'Đã chuyển sản phẩm sang trạng thái Tạm Ngưng Bán. Bây giờ bạn có thể chỉnh sửa thông tin!',
        { type: 'success' }
      )
    } catch (err) {
      notify(err.message || 'Không thể chuyển trạng thái sản phẩm', { type: 'error' })
    } finally {
      setIsSettingMaintain(false)
    }
  }

  const handleUpdateProduct = async (productId, payload) => {
    if (product && product.status !== 'MAINTAIN') {
      notify(
        'Sản phẩm phải được chuyển sang trạng thái Tạm Ngưng Bán trước khi chỉnh sửa!',
        { type: 'error' }
      )
      throw new Error('Sản phẩm phải được chuyển sang trạng thái Tạm Ngưng Bán trước khi chỉnh sửa')
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
          throw new Error('Không tìm thấy thông tin sản phẩm này')
        }
        setProduct(prodRes.data)
      }
    } catch (err) {
      console.error('Failed to load edit product page data:', err)
      setError(err.message || 'Không thể tải dữ liệu sản phẩm')
      notify(err.message || 'Lỗi khi tải thông tin sản phẩm', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [id, isEditing, notify])

  useEffect(() => {
    void loadData()
  }, [loadData])

  return (
    <div className="relative w-full pb-32 text-white font-body-md">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
      </div>

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
              Quay Lại Quản Lý Shop
            </Button>
            <div className="h-5 w-px bg-white/20" />
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span
                onClick={() => navigate(paths.adminShop)}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Quản Trị Cửa Hàng
              </span>
              <Icon name="chevron_right" className="text-xs text-white/30" />
              <span className="text-white/80 font-bold">
                {isEditing ? `Chỉnh Sửa: ${product?.name || id}` : 'Thêm Mới Sản Phẩm'}
              </span>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="p-20 text-center rounded-3xl bg-[#140a24]/90 border border-white/10 shadow-2xl space-y-4">
            <span className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin inline-block mx-auto" />
            <p className="text-sm font-bold text-white/70">
              Đang tải dữ liệu sản phẩm và danh mục...
            </p>
          </div>
        ) : error ? (
          <div className="p-12 text-center rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-4">
            <Icon name="error" className="text-4xl text-rose-400" />
            <h3 className="text-base font-bold text-white">{error}</h3>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => navigate(paths.adminShop)}>
                Về Trang Quản Trị
              </Button>
              <Button variant="gold" size="sm" onClick={loadData}>
                Thử Lại
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {isEditing && product && product.status !== 'MAINTAIN' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl animate-fade-in">
                <div className="flex items-center gap-3.5">
                  <span className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-md">
                    <Icon name="lock" className="text-2xl" />
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>Sản phẩm đang ở trạng thái {product.status === 'ACTIVE' ? 'Mở Bán (ACTIVE)' : product.status}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Chưa Thể Sửa
                      </span>
                    </h4>
                    <p className="text-xs text-amber-300/80 mt-0.5">
                      Theo quy chuẩn an toàn, bạn phải chuyển sản phẩm sang trạng thái <strong>Tạm Ngưng Bán</strong> trước khi có thể lưu thay đổi.
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
                  Chuyển Sang Tạm Ngưng Ngay
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
                    ? `Đã cập nhật sản phẩm "${product?.name || ''}" thành công!`
                    : 'Đã tạo sản phẩm mới thành công!',
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
