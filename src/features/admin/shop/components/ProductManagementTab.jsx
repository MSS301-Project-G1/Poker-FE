import { useState, useMemo } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { getTierBadge, formatVipCoin, formatVnd } from '../utils/adminFormatters'
import { isCardProduct } from '@/features/shop'
import DeckSkinZipModal from './DeckSkinZipModal'

export default function ProductManagementTab({
  products = [],
  categories = [],
  loading = false,
  deleteProduct,
  uploadDeckSkinZip,
  onRefresh,
  onOpenAddProduct,
  onEditProduct,
  page = 0,
  setPage,
  size = 10,
  setSize,
  totalPages = 1,
  totalElements = 0,
  selectedCategory = 'ALL',
  setSelectedCategory,
  selectedTier = 'ALL',
  setSelectedTier,
}) {
  const notify = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [zipModalProduct, setZipModalProduct] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Local fallback filters if not controlled by parent
  const [localCategory, setLocalCategory] = useState('ALL')
  const [localTier, setLocalTier] = useState('ALL')
  const activeCategory = setSelectedCategory ? selectedCategory : localCategory
  const activeTier = setSelectedTier ? selectedTier : localTier

  const handleCategorySelect = cat => {
    if (setSelectedCategory) setSelectedCategory(cat)
    else setLocalCategory(cat)
  }

  const handleTierSelect = tier => {
    if (setSelectedTier) setSelectedTier(tier)
    else setLocalTier(tier)
  }

  // KPI Dashboard Stats
  const stats = useMemo(() => {
    const total = totalElements || products.length
    const cardDecks = products.filter(p => isCardProduct(p)).length
    const vipItems = products.filter(p => p.tier === 'VIP' || p.tier === 'SUPER_VIP').length
    const exclusive = products.filter(p => p.isExclusive).length
    return { total, cardDecks, vipItems, exclusive }
  }, [products, totalElements])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!setSelectedCategory && activeCategory !== 'ALL' && p.categoryCode !== activeCategory) return false
      if (!setSelectedTier && activeTier !== 'ALL' && p.tier !== activeTier) return false
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const name = (p.name || '').toLowerCase()
        const code = (p.categoryCode || '').toLowerCase()
        if (!name.includes(q) && !code.includes(q)) return false
      }
      return true
    })
  }, [products, setSelectedCategory, activeCategory, setSelectedTier, activeTier, searchTerm])

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    setIsDeleting(true)
    try {
      await deleteProduct(productToDelete.id)
      notify(`Đã xóa vĩnh viễn sản phẩm "${productToDelete.name}" thành công!`, { type: 'success' })
      setProductToDelete(null)
      onRefresh?.()
    } catch (err) {
      notify(err.message || 'Xóa sản phẩm thất bại', { type: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header with Control Panel Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#170a2c] via-[#140926] to-[#0d041a] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 shadow-sm">
              Dashboard
            </span>
            <span className="text-xs text-white/50">• Trung Tâm Quản Trị Kho & Skin Bài Tây</span>
          </div>
          <h2 className="font-headline font-black text-2xl text-white flex items-center gap-3">
            <Icon name="inventory_2" className="text-amber-400 text-3xl" />
            <span>Bảng Điều Khiển Kho Vật Phẩm</span>
          </h2>
          <p className="text-xs text-white/60 mt-1 max-w-xl">
            Quản lý toàn bộ danh mục skin poker, thiết lập đơn giá VIP Coin, xóa hoặc nạp bộ texture 53 lá bài trực tiếp lên S3 / MinIO.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <Button
            variant="gold"
            size="md"
            icon="add_circle"
            onClick={() => onOpenAddProduct?.('STANDARD')}
          >
            Thêm Vật Phẩm Mới
          </Button>

          <button
            type="button"
            onClick={() => onOpenAddProduct?.('CARD_SKIN')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400/50 text-amber-300 hover:bg-amber-500/30 font-bold text-xs shadow-lg shadow-amber-500/10 transition-all"
          >
            <Icon name="style" className="text-base" />
            <span>Thêm Skin Lá Bài (52 Lá)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#140a24]/90 border border-white/10 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center font-black">
            <Icon name="inventory_2" className="text-2xl" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
              Tổng Vật Phẩm
            </span>
            <span className="font-headline font-black text-xl text-white">
              {stats.total}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#140a24]/90 border border-white/10 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-black">
            <Icon name="style" className="text-2xl" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
              Bộ Skin Bài Tây
            </span>
            <span className="font-headline font-black text-xl text-purple-300">
              {stats.cardDecks}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#140a24]/90 border border-white/10 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center justify-center font-black">
            <Icon name="workspace_premium" className="text-2xl" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
              Hạng VIP & Super VIP
            </span>
            <span className="font-headline font-black text-xl text-amber-400">
              {stats.vipItems}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#140a24]/90 border border-white/10 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-black">
            <Icon name="lock" className="text-2xl" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
              Vật Phẩm Độc Quyền
            </span>
            <span className="font-headline font-black text-xl text-rose-300">
              {stats.exclusive}
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Horizontal Pills */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleCategorySelect('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeCategory === 'ALL'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          Tất cả ({totalElements || products.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.code}
            type="button"
            onClick={() => handleCategorySelect(cat.code)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === cat.code
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search & Tier Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={activeTier}
            onChange={e => handleTierSelect(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">Tất cả Hạng Tier</option>
            <option value="NORMAL">Standard</option>
            <option value="VIP">VIP</option>
            <option value="SUPER_VIP">SUPER VIP</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-base" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã danh mục..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-3xl bg-[#140a24]/95 border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-white/60 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Ảnh Asset</th>
                <th className="p-4">Tên Sản Phẩm</th>
                <th className="p-4">Danh Mục</th>
                <th className="p-4">Hạng Tier</th>
                <th className="p-4">Đơn Giá VIP / VNĐ</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
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
                    <Icon name="search_off" className="text-4xl text-white/20 mb-2 block mx-auto" />
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const tier = getTierBadge(p.tier)

                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="w-14 h-14 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center p-1.5 shadow-md overflow-hidden">
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
                      <td className="p-4">
                        <span className="font-headline font-bold text-white text-sm block">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-white/50 block mt-0.5 max-w-xs truncate">
                          {p.description || 'Chưa có mô tả'}
                        </span>
                      </td>
                      <td className="p-4 text-white/80 font-medium">
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 font-semibold inline-block">
                          {p.categoryName || p.categoryCode}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${tier.className}`}>
                          {tier.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-amber-400 font-black text-sm block font-headline">
                          {formatVipCoin(p.priceVipCoin)} VIP
                        </span>
                        <span className="text-white/40 text-[11px] block mt-0.5">
                          {formatVnd(p.priceVnd)}
                        </span>
                      </td>
                      <td className="p-4">
                        {p.isExclusive ? (
                          <span className="text-rose-300 font-bold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[11px] inline-flex items-center gap-1">
                            <Icon name="lock" className="text-xs" /> Độc Quyền
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] inline-flex items-center gap-1">
                            <Icon name="check_circle" className="text-xs" /> Mở Bán
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onEditProduct?.(p)}
                          className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                          title="Chỉnh sửa thông tin sản phẩm"
                        >
                          <Icon name="edit" className="text-sm" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                          title="Xóa sản phẩm"
                        >
                          <Icon name="delete" className="text-sm" />
                          <span>Xóa</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-white/10 bg-black/40 text-xs">
          {/* Left: Range info & size selector */}
          <div className="flex items-center gap-3 text-white/60 flex-wrap">
            <span>
              Hiển thị{' '}
              <strong className="text-white font-bold">
                {totalElements === 0 ? 0 : page * size + 1}
              </strong>{' '}
              -{' '}
              <strong className="text-white font-bold">
                {Math.min((page + 1) * size, totalElements || products.length)}
              </strong>{' '}
              trên tổng số{' '}
              <strong className="text-amber-400 font-black">
                {totalElements || products.length}
              </strong>{' '}
              sản phẩm
            </span>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <span>Mỗi trang:</span>
              <select
                value={size}
                onChange={e => {
                  setSize?.(Number(e.target.value))
                }}
                className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value={5} className="bg-[#170a2c] text-white">5</option>
                <option value={10} className="bg-[#170a2c] text-white">10</option>
                <option value={20} className="bg-[#170a2c] text-white">20</option>
                <option value={50} className="bg-[#170a2c] text-white">50</option>
              </select>
            </div>
          </div>

          {/* Right: Page Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 0 || loading}
              onClick={() => setPage?.(prev => Math.max(0, prev - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold"
            >
              <Icon name="chevron_left" className="text-base" />
              <span>Trước</span>
            </button>

            {/* Page pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i)
                .filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1]
                  const showEllipsis = prev !== undefined && p - prev > 1

                  return (
                    <div key={p} className="flex items-center gap-1">
                      {showEllipsis && <span className="text-white/30 px-1">...</span>}
                      <button
                        type="button"
                        onClick={() => setPage?.(p)}
                        disabled={loading}
                        className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center transition-all ${
                          page === p
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                            : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {p + 1}
                      </button>
                    </div>
                  )
                })}
            </div>

            <button
              type="button"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage?.(prev => Math.min(totalPages - 1, prev + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold"
            >
              <span>Tiếp</span>
              <Icon name="chevron_right" className="text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Upload ZIP */}
      <DeckSkinZipModal
        product={zipModalProduct}
        isOpen={Boolean(zipModalProduct)}
        onClose={() => setZipModalProduct(null)}
        onUploadSuccess={onRefresh}
        uploadDeckSkinZip={uploadDeckSkinZip}
      />

      {/* Custom Confirmation Modal for Deletion */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#170c2a] border border-rose-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Icon name="warning" className="text-2xl" />
              </span>
              <div>
                <h3 className="font-headline font-black text-lg text-white">
                  Xác Nhận Xóa Sản Phẩm
                </h3>
                <p className="text-xs text-white/50">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                <img
                  alt={productToDelete.name}
                  src={productToDelete.previewUrl || productToDelete.assetUrl}
                  className="w-full h-full object-contain"
                  onError={e => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div className="min-w-0">
                <span className="font-headline font-bold text-sm text-white block truncate">
                  {productToDelete.name}
                </span>
                <span className="text-xs text-amber-400 font-mono block">
                  {formatVipCoin(productToDelete.priceVipCoin)} VIP Coin
                </span>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn vật phẩm này? Sản phẩm sẽ bị gỡ khỏi Shop và dữ liệu liên quan sẽ bị xóa.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
              >
                Hủy Bỏ
              </Button>
              <Button
                variant="danger"
                size="md"
                icon="delete_forever"
                loading={isDeleting}
                onClick={handleConfirmDelete}
              >
                Xác Nhận Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
