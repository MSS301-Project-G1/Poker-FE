import { useState, useMemo } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { getTierBadge, formatVipCoin, formatVnd } from '../utils/adminFormatters'
import { isCardProduct } from '@/features/shop'
import DeckSkinZipModal from './DeckSkinZipModal'
import ProductDeletionZoneModal from './ProductDeletionZoneModal'
import ScheduleDeletionModal from './ScheduleDeletionModal'
import {
  maintainProduct,
  activateProduct,
  cancelScheduledProductDeletion,
  executeProductDeletion,
} from '../services/adminShopService'

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
  selectedStatus = 'ALL',
  setSelectedStatus,
}) {
  const notify = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [zipModalProduct, setZipModalProduct] = useState(null)
  const [isDeleteZoneOpen, setIsDeleteZoneOpen] = useState(false)
  const [productToScheduleDelete, setProductToScheduleDelete] = useState(null)
  const [productToImmediateDelete, setProductToImmediateDelete] = useState(null)
  const [isDeletingExecuting, setIsDeletingExecuting] = useState(false)
  const [isActivatingId, setIsActivatingId] = useState(null)
  const [isCancellingId, setIsCancellingId] = useState(null)

  // Revocation state
  const [productToRevoke, setProductToRevoke] = useState(null)
  const [revokeReason, setRevokeReason] = useState('')
  const [isRevoking, setIsRevoking] = useState(false)

  // Local fallback filters if not controlled by parent
  const [localCategory, setLocalCategory] = useState('ALL')
  const [localTier, setLocalTier] = useState('ALL')
  const [localStatus, setLocalStatus] = useState('ALL')
  const activeCategory = setSelectedCategory ? selectedCategory : localCategory
  const activeTier = setSelectedTier ? selectedTier : localTier
  const activeStatus = setSelectedStatus ? selectedStatus : localStatus

  const handleCategorySelect = cat => {
    if (setSelectedCategory) setSelectedCategory(cat)
    else setLocalCategory(cat)
  }

  const handleTierSelect = tier => {
    if (setSelectedTier) setSelectedTier(tier)
    else setLocalTier(tier)
  }

  const handleStatusSelect = status => {
    if (setSelectedStatus) setSelectedStatus(status)
    else setLocalStatus(status)
  }

  // KPI Dashboard Stats
  const stats = useMemo(() => {
    const total = totalElements || products.length
    const cardDecks = products.filter(p => isCardProduct(p)).length
    const vipItems = products.filter(p => p.tier === 'VIP' || p.tier === 'SUPER_VIP').length
    const maintenanceItems = products.filter(p => p.status === 'MAINTAIN').length
    const deletingItems = products.filter(p => p.isDeleting).length
    return { total, cardDecks, vipItems, maintenanceItems, deletingItems }
  }, [products, totalElements])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!setSelectedCategory && activeCategory !== 'ALL' && p.categoryCode !== activeCategory) return false
      if (!setSelectedTier && activeTier !== 'ALL' && p.tier !== activeTier) return false
      if (!setSelectedStatus && activeStatus !== 'ALL') {
        if (activeStatus === 'MAINTAIN' && p.status !== 'MAINTAIN') return false
        if (activeStatus === 'ACTIVE' && p.status !== 'ACTIVE') return false
        if (activeStatus === 'DELETING' && !p.isDeleting) return false
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const name = (p.name || '').toLowerCase()
        const code = (p.categoryCode || '').toLowerCase()
        if (!name.includes(q) && !code.includes(q)) return false
      }
      return true
    })
  }, [products, setSelectedCategory, activeCategory, setSelectedTier, activeTier, setSelectedStatus, activeStatus, searchTerm])

  const handleConfirmRevoke = async () => {
    if (!productToRevoke) return
    setIsRevoking(true)
    try {
      const response = await maintainProduct(productToRevoke.id)
      notify(
        response?.data?.message ||
          response?.message ||
          'Đã chuyển sản phẩm sang trạng thái Tạm Ngưng Bán. Kho đồ người chơi được bảo lưu an toàn 100%!',
        { type: 'success' }
      )
      setProductToRevoke(null)
      setRevokeReason('')
      onRefresh?.()
    } catch (err) {
      notify(err.message || 'Chuyển trạng thái tạm ngưng bán thất bại', { type: 'error' })
    } finally {
      setIsRevoking(false)
    }
  }

  const handleActivateProduct = async product => {
    setIsActivatingId(product.id)
    try {
      await activateProduct(product.id)
      notify(`Đã mở bán lại sản phẩm "${product.name}" trên Cửa Hàng thành công!`, { type: 'success' })
      onRefresh?.()
    } catch (err) {
      notify(err.message || 'Mở bán lại sản phẩm thất bại', { type: 'error' })
    } finally {
      setIsActivatingId(null)
    }
  }

  const handleCancelScheduledDeletion = async product => {
    setIsCancellingId(product.id)
    try {
      await cancelScheduledProductDeletion(product.id)
      notify(`Đã hủy lệnh xóa sản phẩm "${product.name}", đưa về Tạm Ngưng an toàn!`, { type: 'success' })
      onRefresh?.()
    } catch (err) {
      notify(err.message || 'Hủy lệnh xóa sản phẩm thất bại', { type: 'error' })
    } finally {
      setIsCancellingId(null)
    }
  }

  const handleConfirmExecuteDeletion = async () => {
    if (!productToImmediateDelete) return
    setIsDeletingExecuting(true)
    try {
      const res = await executeProductDeletion(productToImmediateDelete.id)
      notify(
        res?.data?.message ||
          res?.message ||
          `Đã xóa vĩnh viễn sản phẩm "${productToImmediateDelete.name}" và tự động hoàn tiền thành công!`,
        { type: 'success' }
      )
      setProductToImmediateDelete(null)
      onRefresh?.()
    } catch (err) {
      notify(err.message || 'Xóa sản phẩm thất bại', { type: 'error' })
    } finally {
      setIsDeletingExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
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
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-black">
            <Icon name="pause_circle" className="text-2xl" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
              Đang Tạm Ngưng
            </span>
            <span className="font-headline font-black text-xl text-amber-300">
              {stats.maintenanceItems}
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

      {/* Search & Tier + Status Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tier Filter */}
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

          {/* Status Filter */}
          <select
            value={activeStatus}
            onChange={e => handleStatusSelect(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">Tất cả Trạng Thái</option>
            <option value="ACTIVE">Đang Mở Bán (ACTIVE)</option>
            <option value="MAINTAIN">Đang Tạm Ngưng (MAINTAIN)</option>
            <option value="DELETING">Đang Chờ Xóa (Đếm Ngược)</option>
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
                  const isMaintain = p.status === 'MAINTAIN'
                  const isDeleting = p.isDeleting

                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="w-14 h-14 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center p-1.5 shadow-md overflow-hidden relative">
                          <img
                            alt={p.name}
                            src={p.previewUrl || p.assetUrl}
                            className="w-full h-full object-contain"
                            onError={e => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          {isDeleting ? (
                            <div className="absolute inset-0 bg-rose-950/80 flex items-center justify-center text-rose-400">
                              <Icon name="timer" className="text-xl animate-pulse" />
                            </div>
                          ) : isMaintain ? (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-amber-400" title="Đang tạm ngưng bán">
                              <Icon name="pause_circle" className="text-lg" />
                            </div>
                          ) : null}
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
                        {isDeleting ? (
                          <span className="text-rose-400 font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] inline-flex items-center gap-1 shadow-sm animate-pulse">
                            <Icon name="timer" className="text-xs" /> Đang Chờ Xóa
                          </span>
                        ) : isMaintain ? (
                          <span className="text-amber-300 font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] inline-flex items-center gap-1 shadow-sm">
                            <Icon name="pause_circle" className="text-xs text-amber-400" /> Tạm Ngưng Bán
                          </span>
                        ) : p.isExclusive ? (
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
                        {/* CASE 1: Đang lên lịch xóa (isDeleting) */}
                        {isDeleting ? (
                          <>
                            <button
                              type="button"
                              disabled={isCancellingId === p.id}
                              onClick={() => handleCancelScheduledDeletion(p)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 border border-white/20 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                              title="Hủy lệnh đếm ngược xóa, đưa sản phẩm về Tạm Ngưng an toàn"
                            >
                              <Icon name="undo" className="text-sm" />
                              <span>Hủy Xóa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToImmediateDelete(p)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                              title="Hoàn tất tiêu hủy ngay và tự động hoàn trả 100% VIP Coin vào ví của toàn bộ người chơi sở hữu"
                            >
                              <Icon name="delete_forever" className="text-sm" />
                              <span>Tiêu Hủy Ngay</span>
                            </button>
                          </>
                        ) : isMaintain ? (
                          /* CASE 2: Đang Tạm Ngưng (Maintain) - Cho phép Sửa và Lên Lịch Xóa */
                          <>
                            <button
                              type="button"
                              disabled={isActivatingId === p.id}
                              onClick={() => handleActivateProduct(p)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                              title="Hoàn tất sửa đổi và mở bán lại sản phẩm trên Cửa Hàng (người chơi cũ vẫn giữ nguyên đồ)"
                            >
                              <Icon
                                name={isActivatingId === p.id ? 'progress_activity' : 'storefront'}
                                className={`text-sm ${isActivatingId === p.id ? 'animate-spin' : ''}`}
                              />
                              <span>Mở Bán Lại</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditProduct?.(p)}
                              className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                              title="Chỉnh sửa thông tin, giá bán, hoặc texture của sản phẩm"
                            >
                              <Icon name="edit" className="text-sm" />
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToScheduleDelete(p)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                              title="Lên lịch xóa vĩnh viễn kèm thông báo toàn server và tự động hoàn tiền cho người chơi"
                            >
                              <Icon name="timer" className="text-sm" />
                              <span>Lên Lịch Xóa</span>
                            </button>
                          </>
                        ) : (
                          /* CASE 3: Đang Mở Bán (ACTIVE) - Khóa chức năng Sửa & Xóa, bắt buộc Tạm Ngưng trước */
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setProductToRevoke(p)
                                setRevokeReason('')
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                              title="Tạm ngưng bán trên Shop để bảo trì / sửa chữa (Kho đồ người chơi được bảo lưu an toàn 100%)"
                            >
                              <Icon name="pause_circle" className="text-sm" />
                              <span>Tạm Ngưng</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                notify('Vui lòng chuyển sản phẩm sang trạng thái Tạm Ngưng trước khi chỉnh sửa!', { type: 'warning' })
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white/5 text-white/30 border border-white/10 text-xs font-bold cursor-not-allowed inline-flex items-center gap-1 opacity-60 hover:opacity-80 transition-opacity"
                              title="Vui lòng chuyển sản phẩm sang trạng thái Tạm Ngưng trước khi chỉnh sửa"
                            >
                              <Icon name="lock" className="text-sm text-white/40" />
                              <span>Sửa</span>
                            </button>
                          </>
                        )}
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

          {/* Right: Page navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage?.(page - 1)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
            >
              <Icon name="chevron_left" className="text-base" />
              <span>Trước</span>
            </button>

            {/* Numeric page pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                let pageNumber = idx
                if (totalPages > 5 && page > 2) {
                  pageNumber = Math.min(page - 2 + idx, totalPages - 1)
                }

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage?.(pageNumber)}
                    className={`w-8 h-8 rounded-xl font-bold transition-all text-xs flex items-center justify-center ${
                      page === pageNumber
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    {pageNumber + 1}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage?.(page + 1)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
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

      {/* Dedicated Deletion Zone Modal */}
      <ProductDeletionZoneModal
        isOpen={isDeleteZoneOpen}
        onClose={() => setIsDeleteZoneOpen(false)}
        products={products}
        onDeleteProduct={deleteProduct}
        onRefresh={onRefresh}
      />

      {/* Schedule Deletion Modal */}
      <ScheduleDeletionModal
        product={productToScheduleDelete}
        isOpen={Boolean(productToScheduleDelete)}
        onClose={() => setProductToScheduleDelete(null)}
        onSuccess={onRefresh}
        onImmediateDelete={prod => {
          setProductToScheduleDelete(null)
          setProductToImmediateDelete(prod)
        }}
      />

      {/* Custom Confirmation Modal for Putting into Maintain (TẠM NGƯNG BÁN) */}
      {productToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#170c2a] border border-amber-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Icon name="pause_circle" className="text-2xl" />
              </span>
              <div>
                <h3 className="font-headline font-black text-lg text-white">
                  Chuyển Sang Trạng Thái Tạm Ngưng Bán
                </h3>
                <p className="text-xs text-amber-300/80">
                  Tạm dừng bán trên Cửa Hàng • Kho đồ người chơi được bảo lưu an toàn 100%
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                <img
                  alt={productToRevoke.name}
                  src={productToRevoke.previewUrl || productToRevoke.assetUrl}
                  className="w-full h-full object-contain"
                  onError={e => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div className="min-w-0">
                <span className="font-headline font-bold text-sm text-white block truncate">
                  {productToRevoke.name}
                </span>
                <span className="text-xs text-amber-400 font-mono block">
                  {formatVipCoin(productToRevoke.priceVipCoin)} VIP Coin
                </span>
              </div>
            </div>

            <p className="text-xs text-white/80 leading-relaxed bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              Sản phẩm sẽ được chuyển sang <strong>Tạm Ngưng Bán (Maintain)</strong> và tạm dừng bán trên Cửa Hàng. <strong>Người chơi đã mua trước đó vẫn giữ nguyên vật phẩm trong kho đồ</strong>. Bạn có thể bấm <strong>Sửa</strong> để sửa lỗi hoặc bấm <strong>Mở Bán Lại</strong> bất kỳ lúc nào mà không làm ảnh hưởng đến người chơi.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/80">
                Ghi chú lý do tạm ngưng bán <span className="text-rose-400">*</span>:
              </label>
              <textarea
                rows={3}
                value={revokeReason}
                onChange={e => setRevokeReason(e.target.value)}
                placeholder="Ví dụ: Tạm dừng để cập nhật texture / Chuẩn bị kết thúc mùa giải..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                disabled={isRevoking}
                onClick={() => setProductToRevoke(null)}
              >
                Hủy Bỏ
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={isRevoking}
                onClick={handleConfirmRevoke}
                className="bg-amber-600 hover:bg-amber-500 text-white border-none shadow-lg shadow-amber-950 font-bold"
              >
                Xác Nhận Tạm Ngưng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Immediate Final Delete & Auto-Refund */}
      {productToImmediateDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#170a2a] border border-rose-500/40 p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Icon name="delete_forever" className="text-2xl" />
              </span>
              <div>
                <h3 className="font-headline font-black text-lg text-white">
                  Xác Nhận Tiêu Hủy & Auto-Refund
                </h3>
                <p className="text-xs text-rose-300/80">Xóa vĩnh viễn và hoàn 100% coin cho người chơi</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                <img
                  alt={productToImmediateDelete.name}
                  src={productToImmediateDelete.previewUrl || productToImmediateDelete.assetUrl}
                  className="w-full h-full object-contain"
                  onError={e => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div className="min-w-0">
                <span className="font-headline font-bold text-sm text-white block truncate">
                  {productToImmediateDelete.name}
                </span>
                <span className="text-xs text-amber-400 font-mono block">
                  {formatVipCoin(productToImmediateDelete.priceVipCoin)} VIP Coin
                </span>
              </div>
            </div>

            <p className="text-xs text-rose-200/90 leading-relaxed bg-rose-500/15 p-3 rounded-xl border border-rose-500/30">
              Hệ thống sẽ xóa vĩnh viễn sản phẩm này khỏi toàn bộ database, đồng thời <strong>TỰ ĐỘNG CỘNG THẲNG 100% VIP COIN</strong> vào ví của tất cả người chơi đang sở hữu vật phẩm này. Người chơi không cần phải gửi ticket.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                disabled={isDeletingExecuting}
                onClick={() => setProductToImmediateDelete(null)}
              >
                Hủy Bỏ
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={isDeletingExecuting}
                onClick={handleConfirmExecuteDeletion}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-950"
              >
                Xác Nhận Xóa & Hoàn Tiền Ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
