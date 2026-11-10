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
        `“${activeItems[0].name}” is on sale (ACTIVE). Suspend it (MAINTAIN) before deleting.`,
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
        `“${activeItems[0].name}” is on sale (ACTIVE). Suspend it (MAINTAIN) before deleting.`,
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
        `Deleted ${successCount} products and refunded 100% of the VIP Coin to their owners.`,
        { type: 'success' }
      )
      setSelectedIds(new Set())
      setDragQueue([])
      onRefresh?.()
    }
    if (failCount > 0) {
      notify(`${failCount} products couldn’t be deleted`, { type: 'error' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-obsidian/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="w-full max-w-5xl rounded-2xl bg-surface-container-lowest border border-error/30 shadow-raised flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-on-surface/10 bg-error-container/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="w-12 h-12 rounded-2xl bg-error/20 text-error border border-error/30 flex items-center justify-center shadow-lg shrink-0">
              <Icon name="delete_sweep" className="text-2xl" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-error/30 text-error border border-error/40">
                  Delete list
                </span>
                <span className="text-xs text-on-surface/50">· Delete </span>
              </div>
              <h2 className="font-headline font-bold text-xl text-on-surface mt-0.5">
                Delete products
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-on-surface/5 hover:bg-on-surface/15 text-on-surface/70 hover:text-on-surface flex items-center justify-center transition-all self-end sm:self-center"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        {/* Notice Warning Box */}
        <div className="px-6 py-3 bg-tertiary/10 border-b border-tertiary/20 flex items-center gap-2.5 text-xs text-tertiary-fixed/90">
          <Icon name="warning" className="text-tertiary text-base shrink-0" />
          <span>
            <strong>Important:</strong> Deleting removes products permanently. If a product only has a texture or sound problem, use <strong>Suspend</strong> in the main table to fix it instead.
          </span>
        </div>

        {/* Toolbar & Mode Selection Bar */}
        <div className="p-4 sm:px-6 bg-obsidian/40 border-b border-on-surface/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 text-base" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, category or tier…"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-on-surface/5 border border-on-surface/10 text-xs text-on-surface placeholder-on-surface/30 focus:outline-none focus:border-error"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-on-surface"
              >
                <Icon name="close" className="text-sm" />
              </button>
            )}
          </div>

          {/* 2 Option Mode Switcher as Requested */}
          <div className="flex items-center gap-1.5 p-1 bg-obsidian/60 rounded-2xl border border-on-surface/10 shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={() => setMode('CLICK')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'CLICK'
                  ? 'bg-error-container text-on-error-container font-bold shadow-md '
                  : 'text-on-surface/60 hover:text-on-surface hover:bg-on-surface/5'
              }`}
            >
              <Icon name="checklist" className="text-sm" />
              <span>Option 1: select to delete</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('DRAG')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'DRAG'
                  ? 'bg-error-container text-on-error-container font-bold shadow-md '
                  : 'text-on-surface/60 hover:text-on-surface hover:bg-on-surface/5'
              }`}
            >
              <Icon name="drag_indicator" className="text-sm" />
              <span>Option 2: drag and drop</span>
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[360px]">
          {/* ================= OPTION 1: CLICK TO SELECT ================= */}
          {mode === 'CLICK' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-on-surface/60 pb-1">
                <div className="flex items-center gap-3">
                  <span>
                    Found <strong className="text-on-surface font-bold">{filteredProducts.length}</strong> products
                  </span>
                  <span>•</span>
                  <span>
                    Selected:{' '}
                    <strong className={selectedIds.size > 0 ? 'text-error font-bold' : 'text-on-surface/50'}>
                      {selectedIds.size}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-2.5 py-1 rounded-lg bg-on-surface/5 hover:bg-on-surface/10 text-on-surface/70 hover:text-on-surface text-[11px] font-semibold"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    disabled={selectedIds.size === 0}
                    className="px-2.5 py-1 rounded-lg bg-on-surface/5 hover:bg-on-surface/10 text-on-surface/70 hover:text-on-surface text-[11px] font-semibold disabled:opacity-40"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center text-on-surface/40 flex flex-col items-center justify-center gap-2">
                  <Icon name="search_off" className="text-3xl" />
                  <span className="text-xs">No matching products</span>
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
                            ? 'bg-error/15 border-error/80 shadow-lg ring-1 ring-error/50'
                            : 'bg-obsidian/40 border-on-surface/10 hover:border-on-surface/25 hover:bg-on-surface/5'
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                            isSelected
                              ? 'bg-error-container border-error text-on-error-container shadow-sm'
                              : 'border-on-surface/20 bg-on-surface/5 group-hover:border-on-surface/40'
                          }`}
                        >
                          {isSelected && <Icon name="check" className="text-sm font-bold" />}
                        </div>

                        {/* Product Image */}
                        <div className="w-12 h-12 rounded-xl bg-obsidian/60 border border-on-surface/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
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
                            <Icon name="inventory_2" className="text-on-surface/30 text-xl" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-on-surface truncate">{product.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[11px] text-tertiary font-mono font-bold">
                              {formatVipCoin(product.priceVipCoin)} VIP
                            </span>
                            <span className="text-[11px] text-on-surface/40">•</span>
                            <span className="text-[11px] text-on-surface/50">{product.categoryCode}</span>
                          </div>
                          <div className="mt-1">
                            {isMaintain ? (
                              <span className="text-[11px] text-tertiary-fixed font-bold px-1.5 py-0.2 rounded bg-tertiary/10 border border-tertiary/20">
                                Suspend
                              </span>
                            ) : (
                              <span className="text-[11px] text-success font-bold px-1.5 py-0.2 rounded bg-success/10 border border-success/20">
                                On sale
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
                <div className="flex items-center justify-between text-xs text-on-surface/60">
                  <span className="font-semibold text-on-surface/80 flex items-center gap-1.5">
                    <Icon name="touch_app" className="text-tertiary text-sm" />
                    <span>Products (drag a card to the delete list)</span>
                  </span>
                  <span>{filteredProducts.length} products</span>
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
                            ? 'opacity-40 border-dashed border-on-surface/10 bg-on-surface/5 cursor-not-allowed'
                            : 'bg-obsidian/50 border-on-surface/10 hover:border-tertiary/50 hover:bg-on-surface/5 cursor-grab active:cursor-grabbing hover:shadow-lg'
                        }`}
                      >
                        <Icon name="drag_indicator" className="text-on-surface/30 text-lg shrink-0" />

                        {/* Image */}
                        <div className="w-10 h-10 rounded-xl bg-obsidian/60 border border-on-surface/10 p-0.5 flex items-center justify-center shrink-0">
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
                            <Icon name="inventory_2" className="text-on-surface/30 text-base" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-on-surface truncate">{product.name}</h5>
                          <span className="text-[11px] text-tertiary font-mono block">
                            {formatVipCoin(product.priceVipCoin)} VIP
                          </span>
                          <span className="text-[11px] text-on-surface/40 block truncate">
                            {isMaintain ? 'Suspended' : 'On sale'} • {product.categoryCode}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Column: Incinerator Drop Zone (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <span className="text-xs font-semibold text-error flex items-center gap-1.5">
                  <Icon name="local_fire_department" className="text-error text-sm" />
                  <span>Delete list</span>
                </span>

                <div
                  onDragOver={e => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex-1 rounded-2xl border-2 border-dashed transition-all p-5 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[220px] ${
                    isDragOver
                      ? 'border-error bg-error/20 shadow-raised scale-[1.02]'
                      : 'border-error/30 bg-error/5 hover:border-error/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-error/5 pointer-events-none" />

                  <span
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-raised ${
                      isDragOver
                        ? 'bg-error-container text-on-error-container scale-110 '
                        : 'bg-error/20 text-error border border-error/30'
                    }`}
                  >
                    <Icon name={isDragOver ? 'local_fire_department' : 'delete_forever'} className="text-3xl" />
                  </span>

                  <h4 className="font-headline font-bold text-sm text-on-surface mt-3">
                    {isDragOver ? 'Drop to add to the delete list' : 'Drag items here'}
                  </h4>
                  <p className="text-[11px] text-on-surface/50 max-w-xs mt-1">
                    Drop the products you want to delete here.
                  </p>
                </div>

                {/* Queue of items dropped into incinerator */}
                {dragQueue.length > 0 && (
                  <div className="space-y-2 p-3 rounded-2xl bg-obsidian/60 border border-error/20 max-h-[140px] overflow-y-auto">
                    <div className="flex items-center justify-between text-[11px] text-error font-bold px-1">
                      <span>In the list: {dragQueue.length} products</span>
                      <button
                        type="button"
                        onClick={clearQueue}
                        className="text-on-surface/40 hover:text-on-surface hover:underline text-[11px]"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {dragQueue.map(item => (
                        <div
                          key={item.id}
                          className="px-2.5 py-1.5 rounded-xl bg-error/10 border border-error/20 flex items-center justify-between gap-2"
                        >
                          <span className="text-xs font-bold text-on-surface truncate">{item.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFromQueue(item.id)}
                            className="text-on-surface/40 hover:text-error transition-colors"
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
        <div className="p-4 sm:px-6 bg-obsidian/60 border-t border-on-surface/10 flex items-center justify-between gap-4">
          <div className="text-xs text-on-surface/50">
            {mode === 'CLICK' ? (
              <span>
                Selected: <strong className="text-error font-bold">{selectedIds.size}</strong> products
              </span>
            ) : (
              <span>
                Delete list: <strong className="text-error font-bold">{dragQueue.length}</strong> products
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="md" onClick={onClose}>
              Close
            </Button>

            {mode === 'CLICK' ? (
              <Button
                variant="danger"
                size="md"
                icon="delete_forever"
                disabled={selectedIds.size === 0}
                onClick={handleStartDeleteFromClick}
                className="bg-error-container hover:bg-error-container/80 text-on-error-container font-bold shadow-lg"
              >
                Delete selected ({selectedIds.size})
              </Button>
            ) : (
              <Button
                variant="danger"
                size="md"
                icon="delete_forever"
                disabled={dragQueue.length === 0}
                onClick={handleStartDeleteFromDrag}
                className="bg-error-container hover:bg-error-container/80 text-on-error-container font-bold shadow-lg"
              >
                Delete list ({dragQueue.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Final Safety Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-background border border-error/40 p-6 shadow-raised space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-error/20 text-error border border-error/30 flex items-center justify-center shrink-0">
                <Icon name="delete_forever" className="text-2xl" />
              </span>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Delete permanently?
                </h3>
                <p className="text-xs text-error/80">
                  This will delete {confirmDialog.items.length} products permanently
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-obsidian/50 border border-on-surface/10 max-h-48 overflow-y-auto space-y-2">
              {confirmDialog.items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs text-on-surface">
                  <span className="font-bold truncate">{item.name}</span>
                  <span className="text-tertiary font-mono text-[11px] shrink-0 ml-2">
                    {formatVipCoin(item.priceVipCoin)} VIP
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-error/90 leading-relaxed bg-error/15 p-3 rounded-xl border border-error/30">
              The products are removed from the database and <strong>100% of the original VIP Coin is refunded automatically</strong> to every player who owns them.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                disabled={isDeleting}
                onClick={() => setConfirmDialog(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={isDeleting}
                onClick={executeDeletion}
                className="bg-error-container hover:bg-error-container/80 text-on-error-container font-bold"
              >
                Delete permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
