import { useState, useMemo } from 'react'
import { Icon, useToast } from '@/shared/ui'
import { formatVipCoin } from '../utils/adminFormatters'
import { scheduleProductDeletion } from '../services/adminShopService'

const PRESET_OPTIONS = [
  { label: '1 Phút (Test)', value: 1, unit: 'MINUTES' },
  { label: '5 Phút', value: 5, unit: 'MINUTES' },
  { label: '15 Phút', value: 15, unit: 'MINUTES' },
  { label: '1 Giờ', value: 1, unit: 'HOURS' },
  { label: '24 Giờ (1 ngày)', value: 24, unit: 'HOURS' },
  { label: '72 Giờ (3 ngày)', value: 72, unit: 'HOURS' },
]

export default function ScheduleDeletionModal({
  product,
  isOpen,
  onClose,
  onSuccess,
  onImmediateDelete,
}) {
  const notify = useToast()
  const [durationValue, setDurationValue] = useState(15)
  const [unit, setUnit] = useState('MINUTES') // 'MINUTES' | 'HOURS'
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const effectiveMinutes = useMemo(() => {
    const val = Math.max(1, Number(durationValue) || 1)
    return unit === 'HOURS' ? val * 60 : val
  }, [durationValue, unit])

  const expectedTimeStr = useMemo(() => {
    const date = new Date(Date.now() + effectiveMinutes * 60 * 1000)
    return (
      date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      ' • ' +
      date.toLocaleDateString('vi-VN')
    )
  }, [effectiveMinutes])

  if (!isOpen || !product) return null

  const handleConfirm = async () => {
    if (!notice.trim()) {
      notify('Vui lòng nhập lý do và thông báo xóa cho người chơi', { type: 'error' })
      return
    }

    setLoading(true)
    try {
      await scheduleProductDeletion(product.id, {
        durationMinutes: effectiveMinutes,
        durationHours: Math.max(1, Math.round(effectiveMinutes / 60)),
        notice: notice.trim(),
      })
      const displayDuration = unit === 'HOURS' ? `${durationValue} giờ` : `${durationValue} phút`
      notify(
        `Đã kích hoạt lên lịch xóa sản phẩm "${product.name}" với thời gian đếm ngược ${displayDuration} thành công!`,
        { type: 'success' }
      )
      onSuccess?.()
      onClose()
    } catch (err) {
      notify(err.message || 'Lên lịch xóa sản phẩm thất bại', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#1c0d32] to-[#130722] border border-rose-500/40 p-6 sm:p-8 shadow-2xl space-y-5 text-white my-auto">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/10">
          <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/30 to-rose-700/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950/60">
            <Icon name="timer" className="text-3xl" />
          </span>
          <div>
            <h3 className="font-headline font-black text-xl sm:text-2xl text-white tracking-wide">
              Lên Lịch Xóa & Thông Báo Toàn Server
            </h3>
            <p className="text-sm text-rose-200/90 mt-0.5 leading-relaxed">
              Sản phẩm sẽ đếm ngược công khai trước khi xóa vĩnh viễn và{' '}
              <strong className="text-amber-300">TỰ ĐỘNG hoàn 100% tiền</strong> cho toàn bộ người chơi
            </p>
          </div>
        </div>

        {/* Product summary card */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center gap-4 shadow-inner">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              alt={product.name}
              src={product.previewUrl || product.assetUrl}
              className="w-full h-full object-contain"
              onError={e => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-headline font-bold text-base sm:text-lg text-white block truncate">
              {product.name}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-amber-400 font-mono font-bold">
                {formatVipCoin(product.priceVipCoin)} VIP Coin
              </span>
              <span className="text-xs text-white/30">•</span>
              <span className="text-xs text-white/70 font-semibold px-2 py-0.5 rounded-md bg-white/10 border border-white/10">
                {product.categoryCode}
              </span>
            </div>
          </div>
        </div>

        {/* Duration Selection (Admin Freedom: Phút hoặc Giờ) */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Icon name="schedule" className="text-rose-400 text-base" />
              <span>Thời gian đếm ngược trước khi tiêu hủy:</span>
            </label>
            <div className="text-xs sm:text-sm text-amber-300 font-semibold bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/25 inline-flex items-center gap-1.5 self-start sm:self-auto">
              <Icon name="alarm_on" className="text-amber-400 text-sm" />
              <span>Dự kiến xóa lúc: <strong>{expectedTimeStr}</strong></span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PRESET_OPTIONS.map(opt => {
              const isSelected = durationValue === opt.value && unit === opt.unit
              return (
                <button
                  key={`${opt.value}-${opt.unit}`}
                  type="button"
                  onClick={() => {
                    setDurationValue(opt.value)
                    setUnit(opt.unit)
                  }}
                  className={`py-2.5 px-3 rounded-2xl border text-sm font-bold transition-all text-center ${
                    isSelected
                      ? 'bg-rose-500/30 border-rose-400 text-rose-100 shadow-lg shadow-rose-950/50 ring-2 ring-rose-400/50'
                      : 'bg-black/40 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Custom value and unit selector */}
          <div className="mt-2 flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-sm text-white/80 font-medium">Hoặc tùy chỉnh:</span>
            <input
              type="number"
              min="1"
              max={unit === 'HOURS' ? 720 : 43200}
              value={durationValue}
              onChange={e => setDurationValue(Math.max(1, Number(e.target.value)))}
              className="w-28 px-3.5 py-2 rounded-xl bg-black/70 border border-white/20 text-sm text-white font-mono font-bold focus:outline-none focus:border-rose-400 text-center"
            />
            <select
              value={unit}
              onChange={e => setUnit(e.target.value)}
              className="px-4 py-2 rounded-xl bg-black/70 border border-white/20 text-sm text-white font-bold focus:outline-none focus:border-rose-400 cursor-pointer"
            >
              <option value="MINUTES">Phút (Minutes)</option>
              <option value="HOURS">Giờ (Hours)</option>
            </select>
            <span className="text-sm text-white/60 font-mono ml-auto">
              (Tổng thời gian: <strong className="text-white font-bold">{effectiveMinutes} phút</strong>)
            </span>
          </div>
        </div>

        {/* Notice Message */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-white">
              Lý do xóa & thông báo toàn server <span className="text-rose-400">*</span>:
            </label>
            <span className="text-xs text-white/40">Người chơi sẽ thấy trên Shop & Túi đồ</span>
          </div>
          <textarea
            rows={3}
            value={notice}
            onChange={e => setNotice(e.target.value)}
            placeholder="Ví dụ: Vật phẩm ngừng phát hành theo kế hoạch mùa giải mới. Toàn bộ người chơi sở hữu sẽ được hệ thống tự động hoàn trả 100% VIP Coin khi hết thời gian đếm ngược."
            className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-white/35 text-sm leading-relaxed focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/30 transition-all"
          />
        </div>

        {/* Auto-Refund Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-sm text-amber-200/95 flex items-start gap-3">
          <Icon name="verified_user" className="text-amber-400 text-xl shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-amber-300 font-bold block mb-0.5">
              Cam kết tự động hoàn trả 100% VIP Coin:
            </strong>
            Khi hết thời gian đếm ngược hoặc khi Admin bấm tiêu hủy ngay, hệ thống sẽ tự động cộng thẳng 100% số VIP Coin gốc vào Ví của toàn bộ người chơi đang sở hữu vật phẩm này mà người chơi không cần phải gửi đơn ticket.
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Design Button Tiêu Hủy Ngay as requested */}
          {onImmediateDelete ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => onImmediateDelete(product)}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-900/60 to-rose-700/60 hover:from-rose-800 hover:to-rose-600 text-rose-200 hover:text-white border border-rose-500/50 hover:border-rose-400 font-headline font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-rose-950/50 transition-all active:scale-[0.98] group"
              title="Bỏ qua thời gian đếm ngược, xóa sản phẩm và tự động hoàn tiền vào ví người chơi ngay lập tức"
            >
              <span className="w-6 h-6 rounded-lg bg-rose-500/30 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform">
                <Icon name="delete_forever" className="text-base text-rose-300" />
              </span>
              <span>⚡ Tiêu Hủy Ngay Lập Tức</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/15 font-bold text-sm transition-all active:scale-[0.98]"
            >
              Hủy Bỏ
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleConfirm}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-headline font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-950/60 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="timer" className="text-lg" />
              )}
              <span>Kích Hoạt Lên Lịch Xóa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
