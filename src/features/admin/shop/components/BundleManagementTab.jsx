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
  const [badgeLabel, setBadgeLabel] = useState('Phổ thông')

  // Edit Form state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBundle, setEditingBundle] = useState(null)
  const [editName, setEditName] = useState('')
  const [editCode, setEditCode] = useState('')
  const [editPriceVnd, setEditPriceVnd] = useState(10000)
  const [editBaseVipCoin, setEditBaseVipCoin] = useState(10)
  const [editBonusVipCoin, setEditBonusVipCoin] = useState(0)
  const [editBadgeLabel, setEditBadgeLabel] = useState('Phổ thông')
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
      notify(`Đã ${!currentStatus ? 'bật mở bán' : 'tắt'} gói nạp!`, { type: 'success' })
      onRefresh()
    } catch (err) {
      notify(err.message || 'Thay đổi trạng thái thất bại', { type: 'error' })
    }
  }

  const handleOpenEdit = (b) => {
    if (b.isActive) {
      notify('Vui lòng Tắt Bán gói nạp trước khi chỉnh sửa thông tin!', { type: 'warning' })
      return
    }
    setEditingBundle(b)
    setEditName(b.name || '')
    setEditCode(b.code || '')
    setEditPriceVnd(b.priceVnd || 0)
    setEditBaseVipCoin(b.baseVipCoin || 0)
    setEditBonusVipCoin(b.bonusVipCoin || 0)
    setEditBadgeLabel(b.badgeLabel || 'Phổ thông')
    setEditSortOrder(b.sortOrder ?? 0)
    setIsEditOpen(true)
  }

  const handleOpenDelete = (b) => {
    if (b.isActive) {
      notify('Vui lòng Tắt Bán gói nạp trước khi xóa khỏi hệ thống!', { type: 'warning' })
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
        badgeLabel: badgeLabel?.trim() || 'Phổ thông',
        isActive: true,
        sortOrder: 0,
      })
      notify('Tạo gói nạp mới thành công!', { type: 'success' })
      setName('')
      setCode('')
      setPriceVnd(10000)
      setBaseVipCoin(10)
      setBonusVipCoin(0)
      setBadgeLabel('Phổ thông')
      setIsCreateOpen(false)
      onRefresh()
    } catch (err) {
      notify(err.message || 'Tạo gói nạp thất bại', { type: 'error' })
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
        badgeLabel: editBadgeLabel?.trim() || 'Phổ thông',
        sortOrder: Number(editSortOrder) || 0,
        isActive: false,
      })
      notify(`Cập nhật gói nạp "${editName.trim()}" thành công!`, { type: 'success' })
      setIsEditOpen(false)
      setEditingBundle(null)
      onRefresh()
    } catch (err) {
      notify(err.message || 'Cập nhật gói nạp thất bại', { type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!bundleToDelete) return
    setIsDeleting(true)
    try {
      await deleteBundle(bundleToDelete.id)
      notify(`Đã xóa vĩnh viễn gói nạp ${bundleToDelete.name}!`, { type: 'success' })
      setBundleToDelete(null)
      onRefresh()
    } catch (err) {
      notify(err.message || 'Xóa gói nạp thất bại', { type: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#140a24]/95 border border-white/10 shadow-xl">
        <div>
          <h2 className="font-headline font-black text-2xl text-white flex items-center gap-3">
            <Icon name="paid" className="text-amber-400 text-3xl" />
            <span>Quản Lý Gói Nạp VIP Coin (PayOS)</span>
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Cấu hình bảng tỷ lệ quy đổi VND sang VIP Coin và khuyến mãi nạp tiền trực tuyến
          </p>
        </div>

        <Button variant="gold" size="md" icon="add" onClick={() => setIsCreateOpen(true)}>
          Thêm Gói Nạp
        </Button>
      </div>

      {/* Action / Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang Mở Bán</option>
            <option value="INACTIVE">Tạm Dừng Bán</option>
          </select>

          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-amber-400 text-sm font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="PRICE_ASC">Giá: Thấp → Cao (Tăng dần)</option>
            <option value="PRICE_DESC">Giá: Cao → Thấp (Giảm dần)</option>
            <option value="DEFAULT">Thứ tự mặc định hệ thống</option>
          </select>

          <span className="text-xs font-bold text-white/50 px-2">
            Hiển thị <span className="text-amber-400 font-extrabold">{filteredBundles.length}</span> / {bundles.length} gói nạp
          </span>
        </div>

        {/* Search input with icon */}
        <div className="relative min-w-[280px]">
          <Icon
            name="search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-lg pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên gói, mã code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Bundles Table */}
      <div className="rounded-2xl bg-[#140a24]/95 border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-white/70 font-extrabold uppercase tracking-wider text-xs">
                <th className="py-4 px-5">Mã Gói</th>
                <th className="py-4 px-5">Tên Gói</th>
                <th
                  className="py-4 px-5 cursor-pointer select-none group/th hover:text-amber-300 transition-colors"
                  onClick={() => {
                    setSortOption(prev => (prev === 'PRICE_ASC' ? 'PRICE_DESC' : 'PRICE_ASC'))
                  }}
                  title="Bấm để đổi sắp xếp theo giá tiền"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Giá Bán VND</span>
                    <span className="text-amber-400">
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
                <th className="py-4 px-5">VIP Gốc / Thưởng</th>
                <th className="py-4 px-5">Tổng VIP Coin</th>
                <th className="py-4 px-5">Nhãn Badge</th>
                <th className="py-4 px-5">Trạng Thái</th>
                <th className="py-4 px-5 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-white/50 text-base">
                    <span className="w-7 h-7 border-3 border-amber-400 border-t-transparent rounded-full animate-spin inline-block mr-3" />
                    Đang tải danh sách gói nạp...
                  </td>
                </tr>
              ) : filteredBundles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-white/50 text-base">
                    Không tìm thấy gói nạp phù hợp.
                  </td>
                </tr>
              ) : (
                filteredBundles.map(b => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-5 font-bold text-white/80 tracking-wide font-mono text-xs">
                      {b.code}
                    </td>
                    <td className="py-4 px-5 font-extrabold text-white text-base">
                      {b.name}
                    </td>
                    <td className="py-4 px-5 font-headline font-black text-amber-400 text-base">
                      {formatVnd(b.priceVnd)}
                    </td>
                    <td className="py-4 px-5 font-medium text-white/80">
                      <span className="font-headline font-bold text-white text-sm">
                        {formatVipCoin(b.baseVipCoin)} VIP
                      </span>
                      {b.bonusPercentage > 0 ? (
                        <span className="text-emerald-400 font-bold ml-2 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-xs">
                          +{b.bonusPercentage}%
                        </span>
                      ) : (
                        <span className="text-white/40 ml-2 text-xs font-normal">(Gốc)</span>
                      )}
                    </td>
                    <td className="py-4 px-5 font-headline font-black text-amber-400 text-base">
                      {formatVipCoin(b.totalVipCoin)} VIP
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 tracking-wider">
                        {b.badgeLabel && b.badgeLabel.toLowerCase() !== 'string' ? b.badgeLabel : 'Tiêu Chuẩn'}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {b.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Đang Bán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/50 border border-white/10">
                          <span className="w-2 h-2 rounded-full bg-white/30" />
                          Tạm Dừng
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Nút Bật/Tắt Bán */}
                        <button
                          type="button"
                          onClick={() => handleToggle(b.id, b.isActive)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            b.isActive
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 hover:text-white'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25 hover:text-white'
                          }`}
                          title={b.isActive ? 'Tắt bán gói này để có thể sửa hoặc xóa' : 'Bật mở bán gói nạp cho người dùng'}
                        >
                          {b.isActive ? 'Tắt Bán' : 'Bật Bán'}
                        </button>

                        {/* Nút Sửa: Chỉ sửa được khi đã Tắt Bán */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                            b.isActive
                              ? 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'
                              : 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25 hover:text-white cursor-pointer'
                          }`}
                          title={b.isActive ? 'Vui lòng Tắt Bán gói nạp trước khi chỉnh sửa thông tin!' : 'Chỉnh sửa thông tin gói nạp'}
                        >
                          <Icon name={b.isActive ? 'lock' : 'edit'} className="text-sm" />
                          <span>Sửa</span>
                        </button>

                        {/* Nút Xóa: Chỉ xóa được khi đã Tắt Bán */}
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(b)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                            b.isActive
                              ? 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25 hover:text-white cursor-pointer'
                          }`}
                          title={b.isActive ? 'Vui lòng Tắt Bán gói nạp trước khi xóa khỏi hệ thống!' : 'Xóa vĩnh viễn gói nạp'}
                        >
                          <Icon name={b.isActive ? 'lock' : 'delete'} className="text-sm" />
                          <span>Xóa</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#170c2a] border border-white/20 p-7 shadow-2xl">
            <h3 className="font-headline font-black text-xl text-white mb-5 flex items-center gap-2">
              <Icon name="add_circle" className="text-amber-400" />
              <span>Tạo Gói Nạp VIP Coin Mới</span>
            </h3>
            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="text-white/80 block mb-1.5 font-bold">Tên Gói (Hiển thị):</label>
                <input
                  type="text"
                  required
                  placeholder="Gói Siêu Cấp 500K (+20%)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-white/80 block mb-1.5 font-bold">Mã Gói (Code duy nhất):</label>
                <input
                  type="text"
                  required
                  placeholder="BUNDLE_500K_PROMO"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 block mb-1.5 font-bold">Giá Tiền (VND):</label>
                  <input
                    type="number"
                    min="0"
                    value={priceVnd}
                    onChange={e => setPriceVnd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-white/80 block mb-1.5 font-bold">VIP Coin Gốc:</label>
                  <input
                    type="number"
                    min="1"
                    value={baseVipCoin}
                    onChange={e => setBaseVipCoin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 block mb-1.5 font-bold">VIP Coin Thưởng (Bonus):</label>
                  <input
                    type="number"
                    min="0"
                    value={bonusVipCoin}
                    onChange={e => setBonusVipCoin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-white/80 block mb-1.5 font-bold">Nhãn Badge:</label>
                  <input
                    type="text"
                    value={badgeLabel}
                    onChange={e => setBadgeLabel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="secondary" size="md" type="button" onClick={() => setIsCreateOpen(false)}>
                  Hủy
                </Button>
                <Button variant="gold" size="md" type="submit" loading={isSubmitting}>
                  Tạo Gói Nạp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Gói Nạp */}
      {isEditOpen && editingBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#170c2a] border border-white/20 p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline font-black text-xl text-white flex items-center gap-2">
                <Icon name="edit" className="text-sky-400" />
                <span>Chỉnh Sửa Gói Nạp</span>
              </h3>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-white/10 text-white/70">
                {editingBundle.code}
              </span>
            </div>

            <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
              <Icon name="info" className="text-amber-400 shrink-0 text-base mt-0.5" />
              <span>
                Gói nạp đang ở trạng thái <strong>Tắt Bán</strong> an toàn. Bạn có thể sửa các thông số và chủ động Bật Bán lại sau khi hoàn tất.
              </span>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-sm">
              <div>
                <label className="text-white/80 block mb-1.5 font-bold">Tên Gói (Hiển thị):</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-white/80 block mb-1.5 font-bold">Mã Gói (Code duy nhất):</label>
                <input
                  type="text"
                  required
                  placeholder="BUNDLE_10K"
                  value={editCode}
                  onChange={e => setEditCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm font-mono focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 block mb-1.5 font-bold">Giá Tiền (VND):</label>
                  <input
                    type="number"
                    min="0"
                    value={editPriceVnd}
                    onChange={e => setEditPriceVnd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="text-white/80 block mb-1.5 font-bold">VIP Coin Gốc:</label>
                  <input
                    type="number"
                    min="1"
                    value={editBaseVipCoin}
                    onChange={e => setEditBaseVipCoin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 block mb-1.5 font-bold">VIP Coin Thưởng (Bonus):</label>
                  <input
                    type="number"
                    min="0"
                    value={editBonusVipCoin}
                    onChange={e => setEditBonusVipCoin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="text-white/80 block mb-1.5 font-bold">Nhãn Badge:</label>
                  <input
                    type="text"
                    value={editBadgeLabel}
                    onChange={e => setEditBadgeLabel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/80 block mb-1.5 font-bold">Thứ Tự Sắp Xếp (Sort Order):</label>
                <input
                  type="number"
                  value={editSortOrder}
                  onChange={e => setEditSortOrder(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Tổng kết quy đổi */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center text-xs">
                <span className="text-white/60">Tổng VIP Coin người dùng nhận:</span>
                <span className="font-headline font-bold text-amber-400 text-sm">
                  {formatVipCoin((Number(editBaseVipCoin) || 0) + (Number(editBonusVipCoin) || 0))} VIP
                  {Number(editBaseVipCoin) > 0 && Number(editBonusVipCoin) > 0 && (
                    <span className="ml-1 text-emerald-400 text-xs">
                      (+{Math.round(((Number(editBonusVipCoin) || 0) / (Number(editBaseVipCoin) || 1)) * 100)}%)
                    </span>
                  )}
                </span>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="secondary" size="md" type="button" onClick={() => setIsEditOpen(false)}>
                  Hủy
                </Button>
                <Button variant="gold" size="md" type="submit" loading={isSubmitting}>
                  Lưu Thay Đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Gói Nạp */}
      {bundleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#170c2a] border border-rose-500/30 p-7 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Icon name="delete_forever" className="text-3xl" />
            </div>

            <h3 className="font-headline font-black text-xl text-white text-center mb-2">
              Xóa Vĩnh Viễn Gói Nạp?
            </h3>

            <p className="text-sm text-white/70 text-center mb-4">
              Bạn có chắc chắn muốn xóa gói{' '}
              <strong className="text-white font-extrabold">{bundleToDelete.name}</strong> (
              <span className="font-mono text-xs text-amber-300">{bundleToDelete.code}</span>)?
            </p>

            <div className="p-3 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2 text-left">
              <Icon name="warning" className="text-amber-400 shrink-0 text-base mt-0.5" />
              <span>
                <strong>Lưu ý:</strong> Nếu gói nạp đã từng có người chơi giao dịch (đơn nạp tiền), hệ thống sẽ từ chối xóa vật lý để đảm bảo đối soát kế toán. Trong trường hợp đó, bạn chỉ cần giữ gói ở trạng thái <strong>Tắt Bán</strong>.
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
                Hủy Bỏ
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg hover:shadow-rose-600/30 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isDeleting && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                )}
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
