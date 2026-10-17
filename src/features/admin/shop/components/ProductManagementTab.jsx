import { useState } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { getTierBadge, formatVipCoin, formatVnd } from '../utils/adminFormatters'
import { isCardProduct } from '@/features/shop/utils/shopFormatters'
import DeckSkinZipModal from './DeckSkinZipModal'

export default function ProductManagementTab({
  products = [],
  categories = [],
  loading = false,
  createProduct,
  deleteProduct,
  uploadDeckSkinZip,
  onRefresh,
}) {
  const notify = useToast()
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState('ALL')
  const [zipModalProduct, setZipModalProduct] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New product form state
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState(categories[0]?.code || 'CARD_FACE')
  const [formDescription, setFormDescription] = useState('')
  const [formTier, setFormTier] = useState('VIP')
  const [formPriceVnd, setFormPriceVnd] = useState(50000)
  const [formPriceVipCoin, setFormPriceVipCoin] = useState(50)
  const [formIsExclusive, setFormIsExclusive] = useState(false)
  const [formAssetUrl, setFormAssetUrl] = useState('')
  const [formPreviewVideoUrl, setFormPreviewVideoUrl] = useState('')

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'ALL' && p.categoryCode !== selectedCategory) return false
    if (selectedTier !== 'ALL' && p.tier !== selectedTier) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      const name = (p.name || '').toLowerCase()
      const code = (p.categoryCode || '').toLowerCase()
      if (!name.includes(q) && !code.includes(q)) return false
    }
    return true
  })

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
    try {
      await deleteProduct(id)
      notify('Đã xóa sản phẩm thành công!', { type: 'success' })
      onRefresh()
    } catch (err) {
      notify(err.message || 'Xóa sản phẩm thất bại', { type: 'error' })
    }
  }

  const handleCreateProduct = async e => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createProduct({
        name: formName,
        categoryCode: formCategory,
        description: formDescription,
        tier: formTier,
        priceVnd: Number(formPriceVnd),
        priceVipCoin: Number(formPriceVipCoin),
        isExclusive: formIsExclusive,
        assetUrl: formAssetUrl || 'https://assets.msspoker.com/cards/cyber/back.png',
        previewVideoUrl: formPreviewVideoUrl || null,
      })
      notify('Đã thêm sản phẩm mới thành công!', { type: 'success' })
      setIsCreateModalOpen(false)
      onRefresh()
    } catch (err) {
      notify(err.message || 'Thêm sản phẩm thất bại', { type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header (Image 3 inspired) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#140a24]/95 border border-white/10 shadow-xl">
        <div>
          <h2 className="font-headline font-black text-2xl text-white flex items-center gap-3">
            <Icon name="inventory_2" className="text-amber-400 text-3xl" />
            <span>Kho Sản Phẩm & Skin Bài Tây</span>
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Quản lý catalog vật phẩm, cấu hình đơn giá và nạp texture skin 53 lá bài
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          icon="add"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Thêm Sản Phẩm Mới
        </Button>
      </div>

      {/* Category Filter Horizontal Pills */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
            selectedCategory === 'ALL'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          Tất cả ({products.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.code}
            type="button"
            onClick={() => setSelectedCategory(cat.code)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
              selectedCategory === cat.code
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Action / Search Toolbar (Image 3 layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedTier}
            onChange={e => setSelectedTier(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">Tất cả Hạng Tier</option>
            <option value="NORMAL">Standard</option>
            <option value="VIP">VIP</option>
            <option value="SUPER_VIP">SUPER VIP</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã danh mục..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-[#140a24]/95 border border-white/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-white/60 font-bold uppercase tracking-wider text-xs">
              <th className="p-4">Ảnh</th>
              <th className="p-4">Tên Sản Phẩm</th>
              <th className="p-4">Danh Mục</th>
              <th className="p-4">Hạng Tier</th>
              <th className="p-4">Giá VIP Coin / VND</th>
              <th className="p-4">Độc Quyền</th>
              <th className="p-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-16 text-center text-white/50">
                  <span className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin inline-block mr-3" />
                  Đang tải dữ liệu sản phẩm...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-16 text-center text-white/40">
                  Không tìm thấy sản phẩm nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => {
                const tier = getTierBadge(p.tier)
                const isDeck = isCardProduct(p)

                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="w-14 h-14 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center p-1.5 shadow-md">
                        <img
                          alt={p.name}
                          src={p.previewUrl || p.assetUrl}
                          className="w-full h-full object-contain"
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white text-base">{p.name}</td>
                    <td className="p-4 text-white/80 font-medium">{p.categoryName || p.categoryCode}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${tier.className}`}>
                        {tier.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-amber-400 font-bold text-base block font-headline">
                        {formatVipCoin(p.priceVipCoin)} VIP
                      </span>
                      <span className="text-white/50 text-xs block mt-0.5">{formatVnd(p.priceVnd)}</span>
                    </td>
                    <td className="p-4">
                      {p.isExclusive ? (
                        <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-xs">
                          Có (Khóa)
                        </span>
                      ) : (
                        <span className="text-white/40 text-xs">Không</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {isDeck && (
                        <button
                          type="button"
                          onClick={() => setZipModalProduct(p)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-400/30 text-xs font-bold transition-all shadow-sm"
                          title="Nạp 53 lá bài qua file ZIP"
                        >
                          Nạp 53 Lá ZIP
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all shadow-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Upload ZIP */}
      <DeckSkinZipModal
        product={zipModalProduct}
        isOpen={Boolean(zipModalProduct)}
        onClose={() => setZipModalProduct(null)}
        onUploadSuccess={onRefresh}
        uploadDeckSkinZip={uploadDeckSkinZip}
      />

      {/* Modal Tạo Sản Phẩm Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#170c2a] border border-white/20 p-6 shadow-2xl">
            <h3 className="font-headline font-bold text-base text-white mb-4">Thêm Sản Phẩm Mới</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Tên Sản Phẩm:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Danh Mục:</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#170c2a] border border-white/20 text-white"
                  >
                    {categories.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Hạng Tier:</label>
                  <select
                    value={formTier}
                    onChange={e => setFormTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#170c2a] border border-white/20 text-white"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="VIP">VIP</option>
                    <option value="SUPER_VIP">SUPER_VIP</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Giá VIP Coin:</label>
                  <input
                    type="number"
                    value={formPriceVipCoin}
                    onChange={e => setFormPriceVipCoin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Giá VND:</label>
                  <input
                    type="number"
                    value={formPriceVnd}
                    onChange={e => setFormPriceVnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/60 block mb-1">Mô tả:</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Asset URL (link ảnh/mặt lưng):</label>
                <input
                  type="text"
                  value={formAssetUrl}
                  onChange={e => setFormAssetUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">URL Video Review (Tùy chọn - MP4/WebM hiệu ứng/bàn chơi):</label>
                <input
                  type="text"
                  placeholder="https://.../preview.mp4"
                  value={formPreviewVideoUrl}
                  onChange={e => setFormPreviewVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="exclusive-chk"
                  checked={formIsExclusive}
                  onChange={e => setFormIsExclusive(e.target.checked)}
                />
                <label htmlFor="exclusive-chk" className="text-white/80">
                  Vật phẩm độc quyền (Không cho mua thường, chỉ trao qua sự kiện)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Đóng
                </Button>
                <Button variant="gold" size="sm" type="submit" loading={isSubmitting}>
                  Lưu Sản Phẩm
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
