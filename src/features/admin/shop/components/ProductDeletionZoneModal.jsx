import { useState, useMemo } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { formatVipCoin } from '../utils/adminFormatters'
import { executeProductDeletion } from '../services/adminShopService'

export default function ProductDeletionZoneModal({
  isOpen,
  onClose,
  products = [],
  onDeleteProduct,
  onRefresh,
}) {
  const notify = useToast()
  const [mode, setMode] = useState('CLICK') // 'CLICK' | 'DRAG'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [dragQueue, setDragQueue] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggingId, setDraggingId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(null) // { items: [] }

  if (!isOpen) return null

  // Filter products by search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products
    const q = searchTerm.toLowerCase().trim()
    return products.filter(p => {
      const name = (p.name || '').toLowerCase()
      const code = (p.categoryCode || '').toLowerCase()
      const tier = (p.tier || '').toLowerCase()
      return name.includes(q) || code.includes(q) || tier.includes(q)
    })
  }, [products, searchTerm])

  // --- Click Mode Handlers ---
  const toggleSelect = id => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(filteredProducts.map(p => p.id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  // --- Drag Mode Handlers ---
  const handleDragStart = (e, product) => {
    e.dataTransfer.setData('text/plain', product.id)
    setDraggingId(product.id)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setIsDragOver(false)
  }

  const handleDrop = e => {
    e.preventDefault()
    setIsDragOver(false)
    const productId = e.dataTransfer.getData('text/plain') || draggingId
    if (!productId) return

    const product = products.find(p => p.id === productId)
    if (!product) return

    // Add to drag queue if not already present
    setDragQueue(prev => {
      if (prev.some(p => p.id === product.id)) return prev
      return [...prev, product]
    })
  }

  const removeFromQueue = id => {
    setDragQueue(prev => prev.filter(p => p.id !== id))
  }

  const clearQueue = () => {
    setDragQueue([])
  }

  // --- Delete Execution ---
  const handleStartDeleteFromClick = () => {
    const items = products.filter(p => selectedIds.has(p.id))
    if (items.length === 0) return

    const activeItems = items.filter(p => p.status === 'ACTIVE')
    if (activeItems.length > 0) {
      notify(
        `Vật phẩm "${activeItems[0].name}" đang Mở Bán (ACTIVE). Bạn cần chuyển sang Bảo Trì (Maintain) trước khi xóa!`,
        { type: 'error' }
      )
      return
    }

    setConfirmDialog({ items })
  }

  const handleStartDeleteFromDrag = () => {
    if (dragQueue.length === 0) return

    const activeItems = dragQueue.filter(p => p.status === 'ACTIVE')
    if (activeItems.length > 0) {
      notify(
        `Vật phẩm "${activeItems[0].name}" đang Mở Bán (ACTIVE). Bạn cần chuyển sang Bảo Trì (Maintain) trước khi xóa!`,
        { type: 'error' }
      )
      return
    }

    setConfirmDialog({ items: dragQueue })
  }

  const executeDeletion = async () => {
    if (!confirmDialog?.items?.length) return
    setIsDeleting(true)
    const itemsToDelete = confirmDialog.items
    let successCount = 0
    let failCount = 0

    for (const item of itemsToDelete) {
      try {
        await executeProductDeletion(item.id)
        successCount++
      } catch (err) {
        failCount++
        console.error(`Failed to delete product ${item.name}:`, err)
      }
    }

    setIsDeleting(false)
    setConfirmDialog(null)

    if (successCount > 0) {
      notify(
        `Đã tiêu hủy vĩnh viễn ${successCount} sản phẩm và TỰ ĐỘNG hoàn 100% VIP Coin cho người chơi thành công!`,
        { type: 'success' }
      )
      setSelectedIds(new Set())
      setDragQueue([])
      onRefresh?.()
    }
    if (failCount > 0) {
      notify(`Không thể xóa ${failCount} sản phẩm do phát sinh lỗi`, { type: 'error' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="w-full max-w-5xl rounded-3xl bg-[#130726] border border-rose-500/30 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-rose-950/40 via-[#180931] to-[#120726] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-950/50 shrink-0">
              <Icon name="delete_sweep" className="text-2xl" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-300 border border-rose-500/40">
                  Khu Vực Tiêu Hủy
                </span>
                <span className="text-xs text-white/50">• Xóa Vĩnh Viễn Khỏi Database</span>
              </div>
              <h2 className="font-headline font-black text-xl text-white mt-0.5">
                Quản Trị Tiêu Hủy & Xóa Sản Phẩm
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all self-end sm:self-center"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        {/* Notice Warning Box */}
        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-200/90">
          <Icon name="warning" className="text-amber-400 text-base shrink-0" />
          <span>
            <strong>Lưu ý quan trọng:</strong> Hành động Xóa sẽ xóa vĩnh viễn sản phẩm khỏi hệ thống. Nếu sản phẩm chỉ bị lỗi texture hoặc âm thanh, vui lòng dùng chức năng <strong>Thu Hồi (Bảo Trì)</strong> ở bảng ngoài để sửa chữa thay vì xóa.
          </span>
        </div>

        {/* Toolbar & Mode Selection Bar */}
        <div className="p-4 sm:px-6 bg-black/40 border-b border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-base" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, danh mục, tier..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <Icon name="close" className="text-sm" />
              </button>
            )}
          </div>

          {/* 2 Option Mode Switcher as Requested */}
          <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-2xl border border-white/10 shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={() => setMode('CLICK')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'CLICK'
                  ? 'bg-rose-600 text-white font-black shadow-md shadow-rose-950'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon name="checklist" className="text-sm" />
              <span>Option 1: Click Chọn Để Xóa</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('DRAG')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'DRAG'
                  ? 'bg-rose-600 text-white font-black shadow-md shadow-rose-950'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon name="drag_indicator" className="text-sm" />
              <span>Option 2: Kéo Thả Tiêu Hủy (Drag & Drop)</span>
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[360px]">
          {/* ================= OPTION 1: CLICK TO SELECT ================= */}
          {mode === 'CLICK' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-white/60 pb-1">
                <div className="flex items-center gap-3">
                  <span>
                    Tìm thấy <strong className="text-white font-bold">{filteredProducts.length}</strong> sản phẩm
                  </span>
                  <span>•</span>
                  <span>
                    Đã chọn:{' '}
                    <strong className={selectedIds.size > 0 ? 'text-rose-400 font-bold' : 'text-white/50'}>
                      {selectedIds.size}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-semibold"
                  >
                    Chọn Tất Cả
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    disabled={selectedIds.size === 0}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-semibold disabled:opacity-40"
                  >
                    Bỏ Chọn
                  </button>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center text-white/40 flex flex-col items-center justify-center gap-2">
                  <Icon name="search_off" className="text-3xl" />
                  <span className="text-xs">Không tìm thấy sản phẩm nào phù hợp</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredProducts.map(product => {
                    const isSelected = selectedIds.has(product.id)
                    const isMaintain = product.status === 'MAINTAIN'

                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleSelect(product.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none relative group ${
                          isSelected
                            ? 'bg-rose-500/15 border-rose-500/80 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50'
                            : 'bg-black/40 border-white/10 hover:border-white/25 hover:bg-white/5'
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                            isSelected
                              ? 'bg-rose-500 border-rose-400 text-white shadow-sm'
                              : 'border-white/20 bg-white/5 group-hover:border-white/40'
                          }`}
                        >
                          {isSelected && <Icon name="check" className="text-sm font-black" />}
                        </div>

                        {/* Product Image */}
                        <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          {product.previewUrl || product.assetUrl ? (
                            <img
                              src={product.previewUrl || product.assetUrl}
                              alt={product.name}
                              className="w-full h-full object-contain"
                              onError={e => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <Icon name="inventory_2" className="text-white/30 text-xl" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-white truncate">{product.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-amber-400 font-mono font-bold">
                              {formatVipCoin(product.priceVipCoin)} VIP
                            </span>
                            <span className="text-[10px] text-white/40">•</span>
                            <span className="text-[10px] text-white/50">{product.categoryCode}</span>
                          </div>
                          <div className="mt-1">
                            {isMaintain ? (
                              <span className="text-[10px] text-amber-300 font-bold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                                Đang Bảo Trì
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                                Mở Bán
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= OPTION 2: DRAG & DROP TO INCINERATOR ================= */}
          {mode === 'DRAG' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[380px]">
              {/* Left Column: Draggable Products List (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="font-semibold text-white/80 flex items-center gap-1.5">
                    <Icon name="touch_app" className="text-amber-400 text-sm" />
                    <span>Danh sách sản phẩm (Giữ và kéo thẻ sang lò tiêu hủy)</span>
                  </span>
                  <span>{filteredProducts.length} sản phẩm</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {filteredProducts.map(product => {
                    const isQueued = dragQueue.some(p => p.id === product.id)
                    const isMaintain = product.status === 'MAINTAIN'

                    return (
                      <div
                        key={product.id}
                        draggable={!isQueued}
                        onDragStart={e => handleDragStart(e, product)}
                        onDragEnd={handleDragEnd}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-3 select-none ${
                          isQueued
                            ? 'opacity-40 border-dashed border-white/10 bg-white/5 cursor-not-allowed'
                            : 'bg-black/50 border-white/10 hover:border-amber-400/50 hover:bg-white/5 cursor-grab active:cursor-grabbing hover:shadow-lg'
                        }`}
                      >
                        <Icon name="drag_indicator" className="text-white/30 text-lg shrink-0" />

                        {/* Image */}
                        <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 p-0.5 flex items-center justify-center shrink-0">
                          {product.previewUrl || product.assetUrl ? (
                            <img
                              src={product.previewUrl || product.assetUrl}
                              alt={product.name}
                              className="w-full h-full object-contain"
                              onError={e => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <Icon name="inventory_2" className="text-white/30 text-base" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-white truncate">{product.name}</h5>
                          <span className="text-[10px] text-amber-400 font-mono block">
                            {formatVipCoin(product.priceVipCoin)} VIP
                          </span>
                          <span className="text-[9px] text-white/40 block truncate">
                            {isMaintain ? 'Bảo Trì' : 'Mở Bán'} • {product.categoryCode}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Column: Incinerator Drop Zone (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <Icon name="local_fire_department" className="text-rose-400 text-sm" />
                  <span>Lò Tiêu Hủy / Thùng Rác (Drop Zone)</span>
                </span>

                <div
                  onDragOver={e => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex-1 rounded-3xl border-2 border-dashed transition-all p-5 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[220px] ${
                    isDragOver
                      ? 'border-rose-500 bg-rose-500/20 shadow-2xl shadow-rose-950 scale-[1.02]'
                      : 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />

                  <span
                    className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-xl ${
                      isDragOver
                        ? 'bg-rose-500 text-white scale-110 animate-bounce'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    <Icon name={isDragOver ? 'local_fire_department' : 'delete_forever'} className="text-3xl" />
                  </span>

                  <h4 className="font-headline font-black text-sm text-white mt-3">
                    {isDragOver ? 'Thả Chuột Ngay Để Đưa Vào Lò Tiêu Hủy!' : 'Kéo Thả Vật Phẩm Vào Đây'}
                  </h4>
                  <p className="text-[11px] text-white/50 max-w-xs mt-1">
                    Thả các thẻ sản phẩm muốn xóa vào ô này để tạo danh sách tiêu hủy.
                  </p>
                </div>

                {/* Queue of items dropped into incinerator */}
                {dragQueue.length > 0 && (
                  <div className="space-y-2 p-3 rounded-2xl bg-black/60 border border-rose-500/20 max-h-[140px] overflow-y-auto">
                    <div className="flex items-center justify-between text-[11px] text-rose-300 font-bold px-1">
                      <span>Đã đưa vào lò: {dragQueue.length} sản phẩm</span>
                      <button
                        type="button"
                        onClick={clearQueue}
                        className="text-white/40 hover:text-white hover:underline text-[10px]"
                      >
                        Làm rỗng
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {dragQueue.map(item => (
                        <div
                          key={item.id}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-2"
                        >
                          <span className="text-xs font-bold text-white truncate">{item.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFromQueue(item.id)}
                            className="text-white/40 hover:text-rose-400 transition-colors"
                          >
                            <Icon name="close" className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 sm:px-6 bg-black/60 border-t border-white/10 flex items-center justify-between gap-4">
          <div className="text-xs text-white/50">
            {mode === 'CLICK' ? (
              <span>
                Đang chọn: <strong className="text-rose-400 font-bold">{selectedIds.size}</strong> sản phẩm
              </span>
            ) : (
              <span>
                Lò tiêu hủy: <strong className="text-rose-400 font-bold">{dragQueue.length}</strong> sản phẩm
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="md" onClick={onClose}>
              Đóng
            </Button>

            {mode === 'CLICK' ? (
              <Button
                variant="danger"
                size="md"
                icon="delete_forever"
                disabled={selectedIds.size === 0}
                onClick={handleStartDeleteFromClick}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-950"
              >
                Xác Nhận Tiêu Hủy ({selectedIds.size})
              </Button>
            ) : (
              <Button
                variant="danger"
                size="md"
                icon="delete_forever"
                disabled={dragQueue.length === 0}
                onClick={handleStartDeleteFromDrag}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-950"
              >
                Tiêu Hủy Danh Sách Đã Thả ({dragQueue.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Final Safety Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#1a0b32] border border-rose-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Icon name="delete_forever" className="text-2xl" />
              </span>
              <div>
                <h3 className="font-headline font-black text-lg text-white">
                  Xác Nhận Xóa Vĩnh Viễn?
                </h3>
                <p className="text-xs text-rose-300/80">
                  Hành động này sẽ xóa {confirmDialog.items.length} sản phẩm khỏi toàn bộ hệ thống
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/50 border border-white/10 max-h-48 overflow-y-auto space-y-2">
              {confirmDialog.items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs text-white">
                  <span className="font-bold truncate">{item.name}</span>
                  <span className="text-amber-400 font-mono text-[11px] shrink-0 ml-2">
                    {formatVipCoin(item.priceVipCoin)} VIP
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-rose-200/90 leading-relaxed bg-rose-500/15 p-3 rounded-xl border border-rose-500/30">
              Cảnh báo: Hệ thống sẽ xóa vĩnh viễn sản phẩm khỏi cơ sở dữ liệu, đồng thời <strong>TỰ ĐỘNG HOÀN TRẢ 100% SỐ VIP COIN GỐC</strong> trực tiếp vào Ví của toàn bộ người chơi đang sở hữu vật phẩm này.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                disabled={isDeleting}
                onClick={() => setConfirmDialog(null)}
              >
                Hủy Bỏ
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={isDeleting}
                onClick={executeDeletion}
                className="bg-rose-600 hover:bg-rose-500 text-white font-black"
              >
                Tôi Chắc Chắn, Xóa Ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
