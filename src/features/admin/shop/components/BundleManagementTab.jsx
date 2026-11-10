import { useState } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { formatVipCoin, formatVnd } from '../utils/adminFormatters'

export default function BundleManagementTab({
  bundles = [],
  loading = false,
  toggleBundleActive,
  createBundle,
  updateBundle,
  deleteBundle,
  onRefresh,
}) {
  const notify = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create Form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [priceVnd, setPriceVnd] = useState(10000)
  const [baseVipCoin, setBaseVipCoin] = useState(10)
  const [bonusVipCoin, setBonusVipCoin] = useState(0)
  const [badgeLabel, setBadgeLabel] = useState('Standard')

  // Edit Form state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBundle, setEditingBundle] = useState(null)
  const [editName, setEditName] = useState('')
  const [editCode, setEditCode] = useState('')
  const [editPriceVnd, setEditPriceVnd] = useState(10000)
  const [editBaseVipCoin, setEditBaseVipCoin] = useState(10)
  const [editBonusVipCoin, setEditBonusVipCoin] = useState(0)
  const [editBadgeLabel, setEditBadgeLabel] = useState('Standard')
  const [editSortOrder, setEditSortOrder] = useState(0)

  // Delete State
  const [bundleToDelete, setBundleToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, ACTIVE, INACTIVE
  const [sortOption, setSortOption] = useState('PRICE_ASC') // PRICE_ASC, PRICE_DESC, DEFAULT

  const filteredBundles = [...bundles]
    .filter(b => {
      if (statusFilter === 'ACTIVE' && !b.isActive) return false
      if (statusFilter === 'INACTIVE' && b.isActive) return false
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const nameVal = (b.name || '').toLowerCase()
        const codeVal = (b.code || '').toLowerCase()
        if (!nameVal.includes(q) && !codeVal.includes(q)) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortOption === 'PRICE_ASC') {
        return (Number(a.priceVnd) || 0) - (Number(b.priceVnd) || 0)
      }
      if (sortOption === 'PRICE_DESC') {
        return (Number(b.priceVnd) || 0) - (Number(a.priceVnd) || 0)
      }
      return (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)
    })

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleBundleActive(id, !currentStatus)
      notify(`Coin pack ${!currentStatus ? 'is on sale' : 'taken off sale'}.`, { type: 'success' })
      onRefresh()
    } catch (err) {
      notify(err.message || 'Couldn’t change the status', { type: 'error' })
    }
  }

  const handleOpenEdit = (b) => {
    if (b.isActive) {
      notify('Take the pack off sale before editing it.', { type: 'warning' })
      return
    }
    setEditingBundle(b)
    setEditName(b.name || '')
    setEditCode(b.code || '')
    setEditPriceVnd(b.priceVnd || 0)
    setEditBaseVipCoin(b.baseVipCoin || 0)
    setEditBonusVipCoin(b.bonusVipCoin || 0)
    setEditBadgeLabel(b.badgeLabel || 'Standard')
    setEditSortOrder(b.sortOrder ?? 0)
    setIsEditOpen(true)
  }

  const handleOpenDelete = (b) => {
    if (b.isActive) {
      notify('Take the pack off sale before deleting it.', { type: 'warning' })
      return
    }
    setBundleToDelete(b)
  }

  const handleCreate = async e => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const baseCoin = Number(baseVipCoin) || 0
      const bonusCoin = Number(bonusVipCoin) || 0
      const bonusPct = baseCoin > 0 && bonusCoin > 0 ? Math.round((bonusCoin / baseCoin) * 100) : 0

      await createBundle({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        priceVnd: Number(priceVnd) || 0,
        baseVipCoin: baseCoin,
        bonusVipCoin: bonusCoin,
        bonusPercentage: bonusPct,
        badgeLabel: badgeLabel?.trim() || 'Standard',
        isActive: true,
        sortOrder: 0,
      })
      notify('Coin pack created.', { type: 'success' })
      setName('')
      setCode('')
      setPriceVnd(10000)
      setBaseVipCoin(10)
      setBonusVipCoin(0)
      setBadgeLabel('Standard')
      setIsCreateOpen(false)
      onRefresh()
    } catch (err) {
      notify(err.message || 'Couldn’t create the coin pack', { type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async e => {
    e.preventDefault()
    if (!editingBundle) return
    setIsSubmitting(true)
    try {
      const baseCoin = Number(editBaseVipCoin) || 0
      const bonusCoin = Number(editBonusVipCoin) || 0
      const bonusPct = baseCoin > 0 && bonusCoin > 0 ? Math.round((bonusCoin / baseCoin) * 100) : 0

      await updateBundle(editingBundle.id, {
        code: (editCode || editingBundle.code)?.trim()?.toUpperCase(),
        name: editName.trim(),
        priceVnd: Number(editPriceVnd) || 0,
        baseVipCoin: baseCoin,
        bonusVipCoin: bonusCoin,
        bonusPercentage: bonusPct,
        badgeLabel: editBadgeLabel?.trim() || 'Standard',
        sortOrder: Number(editSortOrder) || 0,
        isActive: false,
      })
      notify(`Updated “${editName.trim()}”.`, { type: 'success' })
      setIsEditOpen(false)
      setEditingBundle(null)
      onRefresh()
    } catch (err) {
      notify(err.message || 'Couldn’t update the coin pack', { type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!bundleToDelete) return
    setIsDeleting(true)
    try {
      await deleteBundle(bundleToDelete.id)
      notify(`Deleted ${bundleToDelete.name}.`, { type: 'success' })
      setBundleToDelete(null)
      onRefresh()
    } catch (err) {
      notify(err.message || 'Couldn’t delete the coin pack', { type: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface-container-lowest/95 border border-on-surface/10 shadow-raised">
        <div>
          <h2 className="font-headline font-bold text-2xl text-on-surface flex items-center gap-3">
            <Icon name="paid" className="text-tertiary text-3xl" />
            <span>VIP Coin packs (PayOS)</span>
          </h2>
          <p className="text-sm text-on-surface/60 mt-1">
            Set VND to VIP Coin rates and top-up bonuses
          </p>
        </div>

        <Button variant="gold" size="md" icon="add" onClick={() => setIsCreateOpen(true)}>
          Add coin pack
        </Button>
      </div>

      {/* Action / Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-on-surface/5 border border-on-surface/10">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm font-bold focus:outline-none focus:border-tertiary cursor-pointer"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">On sale</option>
            <option value="INACTIVE">Off sale</option>
          </select>

          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-tertiary text-sm font-bold focus:outline-none focus:border-tertiary cursor-pointer"
          >
            <option value="PRICE_ASC">Price: low to high</option>
            <option value="PRICE_DESC">Price: high to low</option>
            <option value="DEFAULT">Default order</option>
          </select>

          <span className="text-xs font-bold text-on-surface/50 px-2">
            Showing <span className="text-tertiary font-bold">{filteredBundles.length}</span> / {bundles.length} coin packs
          </span>
        </div>

        {/* Search input with icon */}
        <div className="relative min-w-[280px]">
          <Icon
            name="search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 text-lg pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name or code…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm placeholder:text-on-surface/40 focus:outline-none focus:border-tertiary"
          />
        </div>
      </div>

      {/* Bundles Table */}
      <div className="rounded-2xl bg-surface-container-lowest/95 border border-on-surface/10 overflow-hidden shadow-raised">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-on-surface/10 bg-on-surface/[0.04] text-on-surface/70 font-bold text-xs">
                <th className="py-3 px-3">Code</th>
                <th className="py-3 px-3">Name</th>
                <th
                  className="py-3 px-3 cursor-pointer select-none group/th hover:text-tertiary-fixed transition-colors"
                  onClick={() => {
                    setSortOption(prev => (prev === 'PRICE_ASC' ? 'PRICE_DESC' : 'PRICE_ASC'))
                  }}
                  title="Click to sort by price"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Price (VND)</span>
                    <span className="text-tertiary">
                      {sortOption === 'PRICE_ASC' ? (
                        <Icon name="arrow_upward" className="text-xs" />
                      ) : sortOption === 'PRICE_DESC' ? (
                        <Icon name="arrow_downward" className="text-xs" />
                      ) : (
                        <Icon name="unfold_more" className="text-xs opacity-40 group-hover/th:opacity-100" />
                      )}
                    </span>
                  </div>
                </th>
                <th className="py-3 px-3">Base / bonus VIP</th>
                <th className="py-3 px-3">Total VIP Coin</th>
                <th className="py-3 px-3">Badge</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-on-surface/50 text-base">
                    <span className="w-7 h-7 border-3 border-tertiary border-t-transparent rounded-full animate-spin inline-block mr-3" />
                    Loading coin packs…
                  </td>
                </tr>
              ) : filteredBundles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-on-surface/50 text-base">
                    No matching coin packs.
                  </td>
                </tr>
              ) : (
                filteredBundles.map(b => (
                  <tr key={b.id} className="hover:bg-on-surface/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-on-surface/80 font-mono text-xs">
                      {b.code}
                    </td>
                    <td className="py-3 px-3 font-bold text-on-surface text-base">
                      {b.name}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-headline font-bold text-tertiary text-base">
                      {formatVnd(b.priceVnd)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-on-surface/80">
                      <span className="font-headline font-bold text-on-surface text-sm">
                        {formatVipCoin(b.baseVipCoin)} VIP
                      </span>
                      {b.bonusPercentage > 0 ? (
                        <span className="text-success font-bold ml-2 bg-success/10 px-2 py-0.5 rounded-md border border-success/20 text-xs">
                          +{b.bonusPercentage}%
                        </span>
                      ) : (
                        <span className="text-on-surface/40 ml-2 text-xs font-normal">(base)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-headline font-bold text-tertiary text-base">
                      {formatVipCoin(b.totalVipCoin)} VIP
                    </td>
                    <td className="py-3 px-3">
                      <span className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold bg-tertiary/20 text-tertiary-fixed border border-tertiary/30">
                        {b.badgeLabel && b.badgeLabel.toLowerCase() !== 'string' ? b.badgeLabel : 'Standard'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {b.isActive ? (
                        <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success/20 text-success border border-success/30">
                          <span className="w-2 h-2 rounded-full bg-success" />
                          On sale
                        </span>
                      ) : (
                        <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-on-surface/10 text-on-surface/50 border border-on-surface/10">
                          <span className="w-2 h-2 rounded-full bg-on-surface/30" />
                          Off sale
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {/* Nút Bật/Tắt Bán */}
                        <button
                          type="button"
                          onClick={() => handleToggle(b.id, b.isActive)}
                          className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            b.isActive
                              ? 'bg-tertiary/15 text-tertiary-fixed border-tertiary/30 hover:bg-tertiary/25 hover:text-on-surface'
                              : 'bg-success/15 text-success border-success/30 hover:bg-success/25 hover:text-on-surface'
                          }`}
                          title={b.isActive ? 'Take this pack off sale to edit or delete it' : 'Put this pack on sale'}
                        >
                          {b.isActive ? 'Take off sale' : 'Put on sale'}
                        </button>

                        {/* Nút Sửa: Chỉ sửa được khi đã Tắt Bán */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                            b.isActive
                              ? 'bg-on-surface/5 text-on-surface/30 border-on-surface/10 cursor-not-allowed'
                              : 'bg-primary-container/15 text-primary border-primary-container/30 hover:bg-primary-container/25 hover:text-on-surface cursor-pointer'
                          }`}
                          title={b.isActive ? 'Take the pack off sale before editing it.' : 'Edit coin pack'}
                        >
                          <Icon name={b.isActive ? 'lock' : 'edit'} className="text-sm" />
                          <span>Edit</span>
                        </button>

                        {/* Nút Xóa: Chỉ xóa được khi đã Tắt Bán */}
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(b)}
                          className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                            b.isActive
                              ? 'bg-on-surface/5 text-on-surface/30 border-on-surface/10 cursor-not-allowed'
                              : 'bg-error/15 text-error border-error/30 hover:bg-error/25 hover:text-on-surface cursor-pointer'
                          }`}
                          title={b.isActive ? 'Take the pack off sale before deleting it.' : 'Delete coin pack'}
                        >
                          <Icon name={b.isActive ? 'lock' : 'delete'} className="text-sm" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Gói Nạp */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-background border border-on-surface/20 p-7 shadow-raised">
            <h3 className="font-headline font-bold text-xl text-on-surface mb-5 flex items-center gap-2">
              <Icon name="add_circle" className="text-tertiary" />
              <span>New VIP Coin pack</span>
            </h3>
            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="text-on-surface/80 block mb-1.5 font-bold">Display name:</label>
                <input
                  type="text"
                  required
                  placeholder="Super pack 500K (+20%)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm focus:outline-none focus:border-tertiary"
                />
              </div>
              <div>
                <label className="text-on-surface/80 block mb-1.5 font-bold">Code (unique):</label>
                <input
                  type="text"
                  required
                  placeholder="BUNDLE_500K_PROMO"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm font-mono focus:outline-none focus:border-tertiary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-on-surface/80 block mb-1.5 font-bold">Price (VND):</label>
                  <input
                    type="number"
                    min="0"
                    value={priceVnd}
                    onChange={e => setPriceVnd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm focus:outline-none focus:border-tertiary"
                  />
                </div>
                <div>
                  <label className="text-on-surface/80 block mb-1.5 font-bold">Base VIP Coin:</label>
                  <input
                    type="number"
                    min="1"
                    value={baseVipCoin}
                    onChange={e => setBaseVipCoin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm focus:outline-none focus:border-tertiary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-on-surface/80 block mb-1.5 font-bold">Bonus VIP Coin:</label>
                  <input
                    type="number"
                    min="0"
                    value={bonusVipCoin}
                    onChange={e => setBonusVipCoin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm focus:outline-none focus:border-tertiary"
                  />
                </div>
                <div>
                  <label className="text-on-surface/80 block mb-1.5 font-bold">Badge:</label>
                  <input
                    type="text"
                    value={badgeLabel}
                    onChange={e => setBadgeLabel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm focus:outline-none focus:border-tertiary"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="secondary" size="md" type="button" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gold" size="md" type="submit" loading={isSubmitting}>
                  Create coin pack
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Gói Nạp */}
      {isEditOpen && editingBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-background border border-on-surface/20 p-7 shadow-raised">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2">
                <Icon name="edit" className="text-primary" />
                <span>Edit coin pack</span>
              </h3>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-on-surface/10 text-on-surface/70">
                {editingBundle.code}
              </span>
            </div>

            <div className="p-3 mb-4 rounded-xl bg-tertiary/10 border border-tertiary/20 text-xs text-tertiary-fixed/90 flex items-start gap-2">
              <Icon name="info" className="text-tertiary shrink-0 text-base mt-0.5" />
              <span>
                This pack is <strong>off sale</strong>, so it’s safe to edit. Put it back on sale when you’re done.
              </span>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-sm">
              <div>
                <label className="text-on-surface/80 block mb-1.5 font-bold">Display name:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-on-surface/80 block mb-1.5 font-bold">Code (unique):</label>
                <input
                  type="text"
                  required
                  placeholder="BUNDLE_10K"
                  value={editCode}
                  onChange={e => setEditCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-on-surface/80 block mb-1.5 font-bold">Price (VND):</label>
                  <input
                    type="number"
                    min="0"
                    value={editPriceVnd}
                    onChange={e => setEditPriceVnd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-on-surface/80 block mb-1.5 font-bold">Base VIP Coin:</label>
                  <input
                    type="number"
                    min="1"
                    value={editBaseVipCoin}
                    onChange={e => setEditBaseVipCoin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-on-surface/80 block mb-1.5 font-bold">Bonus VIP Coin:</label>
                  <input
                    type="number"
                    min="0"
                    value={editBonusVipCoin}
                    onChange={e => setEditBonusVipCoin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-on-surface/80 block mb-1.5 font-bold">Badge:</label>
                  <input
                    type="text"
                    value={editBadgeLabel}
                    onChange={e => setEditBadgeLabel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-on-surface/80 block mb-1.5 font-bold">Sort order:</label>
                <input
                  type="number"
                  value={editSortOrder}
                  onChange={e => setEditSortOrder(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-obsidian/60 border border-on-surface/20 text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Tổng kết quy đổi */}
              <div className="p-3 rounded-xl bg-on-surface/5 border border-on-surface/10 flex justify-between items-center text-xs">
                <span className="text-on-surface/60">Total VIP Coin the player gets:</span>
                <span className="font-headline font-bold text-tertiary text-sm">
                  {formatVipCoin((Number(editBaseVipCoin) || 0) + (Number(editBonusVipCoin) || 0))} VIP
                  {Number(editBaseVipCoin) > 0 && Number(editBonusVipCoin) > 0 && (
                    <span className="ml-1 text-success text-xs">
                      (+{Math.round(((Number(editBonusVipCoin) || 0) / (Number(editBaseVipCoin) || 1)) * 100)}%)
                    </span>
                  )}
                </span>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="secondary" size="md" type="button" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gold" size="md" type="submit" loading={isSubmitting}>
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Gói Nạp */}
      {bundleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-background border border-error/30 p-7 shadow-raised">
            <div className="w-12 h-12 rounded-2xl bg-error/20 border border-error/40 text-error flex items-center justify-center mx-auto mb-4">
              <Icon name="delete_forever" className="text-3xl" />
            </div>

            <h3 className="font-headline font-bold text-xl text-on-surface text-center mb-2">
              Delete coin pack?
            </h3>

            <p className="text-sm text-on-surface/70 text-center mb-4">
              Are you sure you want to delete{' '}
              <strong className="text-on-surface font-bold">{bundleToDelete.name}</strong> (
              <span className="font-mono text-xs text-tertiary-fixed">{bundleToDelete.code}</span>)?
            </p>

            <div className="p-3 mb-6 rounded-xl bg-tertiary/10 border border-tertiary/20 text-xs text-tertiary-fixed/90 flex items-start gap-2 text-left">
              <Icon name="warning" className="text-tertiary shrink-0 text-base mt-0.5" />
              <span>
                <strong>Note:</strong> If anyone has bought this pack, the server won’t delete it so the accounting stays intact. In that case, keep it <strong>Take off sale</strong>.
              </span>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={() => setBundleToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-error-container hover:bg-error-container/80 text-on-error-container transition-all shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isDeleting && (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
