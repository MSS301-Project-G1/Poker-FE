import { useState } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { formatVipCoin, formatVnd } from '../utils/adminFormatters'

export default function BundleManagementTab({
  bundles = [],
  loading = false,
  toggleBundleActive,
  createBundle,
  onRefresh,
}) {
  const notify = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [priceVnd, setPriceVnd] = useState(10000)
  const [baseVipCoin, setBaseVipCoin] = useState(10)
  const [bonusVipCoin, setBonusVipCoin] = useState(0)
  const [badgeLabel, setBadgeLabel] = useState('Phổ thông')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, ACTIVE, INACTIVE

  const filteredBundles = bundles.filter(b => {
    if (statusFilter === 'ACTIVE' && !b.isActive) return false
    if (statusFilter === 'INACTIVE' && b.isActive) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      const name = (b.name || '').toLowerCase()
      const code = (b.code || '').toLowerCase()
      if (!name.includes(q) && !code.includes(q)) return false
    }
    return true
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

  const handleCreate = async e => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createBundle({
        name,
        code,
        priceVnd: Number(priceVnd),
        baseVipCoin: Number(baseVipCoin),
        bonusVipCoin: Number(bonusVipCoin),
        badgeLabel,
      })
      notify('Tạo gói nạp mới thành công!', { type: 'success' })
      setIsCreateOpen(false)
      onRefresh()
    } catch (err) {
      notify(err.message || 'Tạo gói nạp thất bại', { type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header (Image 3 inspired) */}
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

      {/* Action / Search Toolbar (Image 3 layout) */}
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
                <th className="py-4 px-5">Giá Bán VND</th>
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
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggle(b.id, b.isActive)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          b.isActive
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30 hover:text-white'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30 hover:text-white'
                        }`}
                      >
                        {b.isActive ? 'Tắt Bán' : 'Bật Bán'}
                      </button>
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
                    value={priceVnd}
                    onChange={e => setPriceVnd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-white/80 block mb-1.5 font-bold">VIP Coin Gốc:</label>
                  <input
                    type="number"
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
    </div>
  )
}
