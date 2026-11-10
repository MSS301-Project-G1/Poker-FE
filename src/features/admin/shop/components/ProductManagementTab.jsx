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
          'Product suspended. Players keep everything they own.',
        { type: 'success' }
      )
      setProductToRevoke(null)
      setRevokeReason('')
      onRefresh?.()
    } catch (err) {
      notify(err.message || 'Couldn’t suspend the product', { type: 'error' })
    } finally {
      setIsRevoking(false)
    }
  }

  const handleActivateProduct = async product => {
    setIsActivatingId(product.id)
    try {
      await activateProduct(product.id)
      notify(`“${product.name}” is back on sale.`, { type: 'success' })
      onRefresh?.()
    } catch (err) {
      notify(err.message || 'Couldn’t put the product back on sale', { type: 'error' })
    } finally {
      setIsActivatingId(null)
    }
  }

  const handleCancelScheduledDeletion = async product => {
    setIsCancellingId(product.id)
    try {
      await cancelScheduledProductDeletion(product.id)
      notify(`Deletion of “${product.name}” cancelled; it’s now suspended.`, { type: 'success' })
      onRefresh?.()
    } catch (err) {
      notify(err.message || 'Couldn’t cancel the deletion', { type: 'error' })
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
          `Deleted “${productToImmediateDelete.name}” and refunded its owners.`,
        { type: 'success' }
      )
      setProductToImmediateDelete(null)
      onRefresh?.()
    } catch (err) {
      notify(err.message || 'Couldn’t delete the product', { type: 'error' })
    } finally {
      setIsDeletingExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container-lowest/90 border border-on-surface/10 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary border border-tertiary/20 flex items-center justify-center font-bold">
            <Icon name="inventory_2" className="text-2xl" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-on-surface/50 block">
              Total items
            </span>
            <span className="font-headline font-bold text-xl text-on-surface">
              {stats.total}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest/90 border border-on-surface/10 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/10 text-secondary border border-secondary-container/20 flex items-center justify-center font-bold">
            <Icon name="style" className="text-2xl" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-on-surface/50 block">
              Card skins
            </span>
            <span className="font-headline font-bold text-xl text-secondary">
              {stats.cardDecks}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest/90 border border-on-surface/10 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary-fixed border border-tertiary/20 flex items-center justify-center font-bold">
            <Icon name="workspace_premium" className="text-2xl" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-on-surface/50 block">
              VIP & Super VIP
            </span>
            <span className="font-headline font-bold text-xl text-tertiary">
              {stats.vipItems}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest/90 border border-on-surface/10 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary border border-tertiary/20 flex items-center justify-center font-bold">
            <Icon name="pause_circle" className="text-2xl" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-on-surface/50 block">
              Suspended
            </span>
            <span className="font-headline font-bold text-xl text-tertiary-fixed">
              {stats.maintenanceItems}
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Horizontal Pills */}
      <div className="flex items-center gap-2 p-1.5 bg-obsidian/40 rounded-2xl border border-on-surface/10 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleCategorySelect('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeCategory === 'ALL'
              ? 'bg-tertiary text-on-tertiary font-bold shadow-md'
              : 'text-on-surface/70 hover:text-on-surface hover:bg-on-surface/10'
          }`}
        >
          All ({totalElements || products.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.code}
            type="button"
            onClick={() => handleCategorySelect(cat.code)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === cat.code
                ? 'bg-tertiary text-on-tertiary font-bold shadow-md'
                : 'text-on-surface/70 hover:text-on-surface hover:bg-on-surface/10'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search & Tier + Status Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-on-surface/5 border border-on-surface/10">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tier Filter */}
          <select
            value={activeTier}
            onChange={e => handleTierSelect(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-obsidian/50 border border-on-surface/15 text-xs font-bold text-on-surface focus:outline-none focus:border-tertiary"
          >
            <option value="ALL">All tiers</option>
            <option value="NORMAL">Standard</option>
            <option value="VIP">VIP</option>
            <option value="SUPER_VIP">Super VIP</option>
          </select>

          {/* Status Filter */}
          <select
            value={activeStatus}
            onChange={e => handleStatusSelect(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-obsidian/50 border border-on-surface/15 text-xs font-bold text-on-surface focus:outline-none focus:border-tertiary"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">On sale (ACTIVE)</option>
            <option value="MAINTAIN">Suspended (MAINTAIN)</option>
            <option value="DELETING">Pending deletion</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 text-base" />
          <input
            type="text"
            placeholder="Search by name or category code…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-obsidian/50 border border-on-surface/15 text-xs text-on-surface placeholder-on-surface/40 focus:outline-none focus:border-tertiary"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-surface-container-lowest/95 border border-on-surface/10 overflow-hidden shadow-raised">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-on-surface/10 bg-on-surface/5 text-on-surface/60 font-bold text-[11px]">
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Tier</th>
                <th className="p-4 whitespace-nowrap">Price (VIP / VND)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/5 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-on-surface/50">
                    <span className="w-8 h-8 border-3 border-tertiary border-t-transparent rounded-full animate-spin inline-block mr-3" />
                    Loading products…
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-on-surface/40">
                    <Icon name="search_off" className="text-4xl text-on-surface/20 mb-2 block mx-auto" />
                    No products match these filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const tier = getTierBadge(p.tier)
                  const isMaintain = p.status === 'MAINTAIN'
                  const isDeleting = p.isDeleting

                  return (
                    <tr key={p.id} className="hover:bg-on-surface/5 transition-colors">
                      <td className="p-4">
                        <div className="w-14 h-14 rounded-2xl bg-obsidian/60 border border-on-surface/10 flex items-center justify-center p-1.5 shadow-md overflow-hidden relative">
                          <img
                            alt={p.name}
                            src={p.previewUrl || p.assetUrl}
                            className="w-full h-full object-contain"
                            onError={e => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          {isDeleting ? (
                            <div className="absolute inset-0 bg-error-container/80 flex items-center justify-center text-error">
                              <Icon name="timer" className="text-xl" />
                            </div>
                          ) : isMaintain ? (
                            <div className="absolute inset-0 bg-obsidian/60 flex items-center justify-center text-tertiary" title="Suspended">
                              <Icon name="pause_circle" className="text-lg" />
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-headline font-bold text-on-surface text-sm block">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-on-surface/50 block mt-0.5 max-w-xs truncate">
                          {p.description || 'No description'}
                        </span>
                      </td>
                      <td className="p-4 text-on-surface/80 font-medium">
                        <span className="px-2.5 py-1 rounded-lg bg-on-surface/5 border border-on-surface/10 text-on-surface/80 font-semibold inline-block">
                          {p.categoryName || p.categoryCode}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${tier.className}`}>
                          {tier.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-tertiary font-bold text-sm block font-headline whitespace-nowrap">
                          {formatVipCoin(p.priceVipCoin)} VIP
                        </span>
                        <span className="text-on-surface/40 text-[11px] block mt-0.5">
                          {formatVnd(p.priceVnd)}
                        </span>
                      </td>
                      <td className="p-4">
                        {isDeleting ? (
                          <span className="text-error font-bold px-2.5 py-0.5 rounded-full bg-error/15 border border-error/30 text-[11px] inline-flex items-center gap-1 shadow-sm">
                            <Icon name="timer" className="text-xs" /> Pending deletion
                          </span>
                        ) : isMaintain ? (
                          <span className="text-tertiary-fixed font-bold px-2.5 py-0.5 rounded-full bg-tertiary/15 border border-tertiary/30 text-[11px] inline-flex items-center gap-1 shadow-sm">
                            <Icon name="pause_circle" className="text-xs text-tertiary" /> Suspended
                          </span>
                        ) : p.isExclusive ? (
                          <span className="text-error font-bold px-2 py-0.5 rounded-full bg-error/10 border border-error/20 text-[11px] inline-flex items-center gap-1">
                            <Icon name="lock" className="text-xs" /> Exclusive
                          </span>
                        ) : (
                          <span className="text-success font-bold px-2 py-0.5 rounded-full bg-success/10 border border-success/20 text-[11px] inline-flex items-center gap-1">
                            <Icon name="check_circle" className="text-xs" /> On sale
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap justify-end gap-2">
                        {/* CASE 1: Đang lên lịch xóa (isDeleting) */}
                        {isDeleting ? (
                          <>
                            <button
                              type="button"
                              disabled={isCancellingId === p.id}
                              onClick={() => handleCancelScheduledDeletion(p)}
                              className="px-3 py-1.5 rounded-xl bg-on-surface/10 hover:bg-on-surface/20 text-on-surface/80 border border-on-surface/20 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                              title="Cancel the deletion countdown and suspend the product"
                            >
                              <Icon name="undo" className="text-sm" />
                              <span>Cancel deletion</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToImmediateDelete(p)}
                              className="px-3 py-1.5 rounded-xl bg-error/20 hover:bg-error/30 text-error border border-error/40 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                              title="Delete now and refund 100% of the VIP Coin to every owner"
                            >
                              <Icon name="delete_forever" className="text-sm" />
                              <span>Delete now</span>
                            </button>
                          </>
                        ) : isMaintain ? (
                          /* CASE 2: Đang Tạm Ngưng (Maintain) - Cho phép Sửa và Lên Lịch Xóa */
                          <>
                            <button
                              type="button"
                              disabled={isActivatingId === p.id}
                              onClick={() => handleActivateProduct(p)}
                              className="px-3 py-1.5 rounded-xl bg-success/20 hover:bg-success/30 text-success border border-success/40 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                              title="Put the product back on sale (owners keep their items)"
                            >
                              <Icon
                                name={isActivatingId === p.id ? 'progress_activity' : 'storefront'}
                                className={`text-sm ${isActivatingId === p.id ? 'animate-spin' : ''}`}
                              />
                              <span>Put on sale</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditProduct?.(p)}
                              className="px-3 py-1.5 rounded-xl bg-tertiary/20 hover:bg-tertiary/30 text-tertiary-fixed border border-tertiary/40 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                              title="Edit details, price or textures"
                            >
                              <Icon name="edit" className="text-sm" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToScheduleDelete(p)}
                              className="px-3 py-1.5 rounded-xl bg-error/20 hover:bg-error/30 text-error border border-error/40 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                              title="Schedule deletion with a server-wide notice and automatic refunds"
                            >
                              <Icon name="timer" className="text-sm" />
                              <span>Schedule deletion</span>
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
                              className="px-3 py-1.5 rounded-xl bg-tertiary/20 hover:bg-tertiary/30 text-tertiary-fixed border border-tertiary/30 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                              title="Take it off the shop for maintenance (owners keep their items)"
                            >
                              <Icon name="pause_circle" className="text-sm" />
                              <span>Suspend</span>
                            </button>
                          </>
                        )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-on-surface/10 bg-obsidian/40 text-xs">
          {/* Left: Range info & size selector */}
          <div className="flex items-center gap-3 text-on-surface/60 flex-wrap">
            <span>
              Showing{' '}
              <strong className="text-on-surface font-bold">
                {totalElements === 0 ? 0 : page * size + 1}
              </strong>{' '}
              -{' '}
              <strong className="text-on-surface font-bold">
                {Math.min((page + 1) * size, totalElements || products.length)}
              </strong>{' '}
              of{' '}
              <strong className="text-tertiary font-bold">
                {totalElements || products.length}
              </strong>{' '}
              products
            </span>
            <span className="text-on-surface/20">|</span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={size}
                onChange={e => {
                  setSize?.(Number(e.target.value))
                }}
                className="px-2.5 py-1 rounded-lg bg-obsidian/60 border border-on-surface/15 text-on-surface font-bold focus:outline-none focus:border-tertiary cursor-pointer"
              >
                <option value={5} className="bg-background text-on-surface">5</option>
                <option value={10} className="bg-background text-on-surface">10</option>
                <option value={20} className="bg-background text-on-surface">20</option>
                <option value={50} className="bg-background text-on-surface">50</option>
              </select>
            </div>
          </div>

          {/* Right: Page navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage?.(page - 1)}
              className="px-3 py-1.5 rounded-xl bg-on-surface/5 hover:bg-on-surface/10 text-on-surface disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
            >
              <Icon name="chevron_left" className="text-base" />
              <span>Previous</span>
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
                        ? 'bg-tertiary text-on-tertiary font-bold shadow-md'
                        : 'bg-on-surface/5 hover:bg-on-surface/10 text-on-surface/70'
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
              className="px-3 py-1.5 rounded-xl bg-on-surface/5 hover:bg-on-surface/10 text-on-surface disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
            >
              <span>Next</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-obsidian/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-surface-container-low border border-tertiary/40 p-6 sm:p-8 shadow-raised space-y-5 text-on-surface">
            <div className="flex items-center gap-4 pb-3 border-b border-on-surface/10">
              <span className="w-14 h-14 rounded-2xl bg-tertiary/20 text-tertiary border border-tertiary/30 flex items-center justify-center shrink-0 shadow-lg">
                <Icon name="pause_circle" className="text-3xl" />
              </span>
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  Suspend product
                </h3>
                <p className="text-sm text-tertiary-fixed/80 mt-0.5">
                  Removed from the shop · Owners keep their items
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian/50 border border-on-surface/10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-on-surface/5 border border-on-surface/10 p-1 flex items-center justify-center shrink-0">
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
                <span className="font-headline font-bold text-base text-on-surface block truncate">
                  {productToRevoke.name}
                </span>
                <span className="text-sm text-tertiary font-mono font-bold block mt-0.5">
                  {formatVipCoin(productToRevoke.priceVipCoin)} VIP Coin
                </span>
              </div>
            </div>

            <p className="text-sm text-on-surface/90 leading-relaxed bg-tertiary/10 p-4 rounded-2xl border border-tertiary/20">
              The product will be <strong>suspended (MAINTAIN)</strong> and hidden from the shop. <strong>Players who bought it keep it in their inventory</strong>. You can press <strong>Edit</strong> to update details or textures, or press <strong>Put on sale</strong> at any time without affecting players.
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface">
                Reason for suspending <span className="text-error">*</span>:
              </label>
              <textarea
                rows={3}
                value={revokeReason}
                onChange={e => setRevokeReason(e.target.value)}
                placeholder="e.g. Updating textures / Season ending soon"
                className="w-full px-4 py-3 rounded-2xl bg-obsidian/60 border border-on-surface/15 text-on-surface placeholder-on-surface/30 text-sm focus:outline-none focus:border-tertiary"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                disabled={isRevoking}
                onClick={() => setProductToRevoke(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={isRevoking}
                onClick={handleConfirmRevoke}
                className="bg-tertiary-container hover:bg-tertiary text-on-tertiary border-none shadow-lg font-bold"
              >
                Suspend
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Immediate Final Delete & Auto-Refund */}
      {productToImmediateDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-obsidian/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-background border border-error/40 p-6 sm:p-8 shadow-raised space-y-5 text-on-surface">
            <div className="flex items-center gap-4 pb-3 border-b border-on-surface/10">
              <span className="w-14 h-14 rounded-2xl bg-error/20 text-error border border-error/30 flex items-center justify-center shrink-0 shadow-lg">
                <Icon name="delete_forever" className="text-3xl" />
              </span>
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  Delete and refund
                </h3>
                <p className="text-sm text-error/80 mt-0.5">
                  Deletes permanently and refunds 100% of the coins to every owner
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian/50 border border-on-surface/10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-on-surface/5 border border-on-surface/10 p-1 flex items-center justify-center shrink-0">
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
                <span className="font-headline font-bold text-base text-on-surface block truncate">
                  {productToImmediateDelete.name}
                </span>
                <span className="text-sm text-tertiary font-mono font-bold block mt-0.5">
                  {formatVipCoin(productToImmediateDelete.priceVipCoin)} VIP Coin
                </span>
              </div>
            </div>

            <p className="text-sm text-error/90 leading-relaxed bg-error/15 p-4 rounded-2xl border border-error/30">
              This product is removed from the database and <strong>100% of the VIP Coin is credited back</strong> to every player who owns it. No ticket or approval needed.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                disabled={isDeletingExecuting}
                onClick={() => setProductToImmediateDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={isDeletingExecuting}
                onClick={handleConfirmExecuteDeletion}
                className="bg-error-container hover:bg-error-container/80 text-on-error-container font-bold shadow-lg px-5 py-2.5"
              >
                Delete and refund now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
