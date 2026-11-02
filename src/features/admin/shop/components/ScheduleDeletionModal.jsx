import { useState } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { formatVipCoin } from '../utils/adminFormatters'
import { scheduleProductDeletion } from '../services/adminShopService'

export default function ScheduleDeletionModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}) {
  const notify = useToast()
  const [durationHours, setDurationHours] = useState(24)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !product) return null

  const handleConfirm = async () => {
    if (!notice.trim()) {
      notify('Vui lòng nhập lý do và thông báo xóa cho người chơi', { type: 'error' })
      return
    }

    setLoading(true)
    try {
      await scheduleProductDeletion(product.id, {
        durationHours: Number(durationHours),
        notice: notice.trim(),
      })
      notify(
        `Đã kích hoạt lên lịch xóa sản phẩm "${product.name}" với thời gian đếm ngược ${durationHours} giờ thành công!`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-[#170a2a] border border-rose-500/40 p-6 shadow-2xl space-y-4 text-white">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <span className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <Icon name="timer" className="text-2xl" />
          </span>
          <div>
            <h3 className="font-headline font-black text-lg text-white">
              Lên Lịch Xóa & Thông Báo Toàn Server
            </h3>
            <p className="text-xs text-rose-300/80">
              Sản phẩm sẽ đếm ngược trước khi xóa vĩnh viễn và TỰ ĐỘNG hoàn tiền cho người chơi
            </p>
          </div>
        </div>

        {/* Product summary card */}
        <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
            <img
              alt={product.name}
              src={product.previewUrl || product.assetUrl}
              className="w-full h-full object-contain"
              onError={e => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <div className="min-w-0">
            <span className="font-headline font-bold text-sm text-white block truncate">
              {product.name}
            </span>
            <span className="text-xs text-amber-400 font-mono block">
              {formatVipCoin(product.priceVipCoin)} VIP Coin • {product.categoryCode}
            </span>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-white/80">
            Thời gian đếm ngược trước khi tiêu hủy:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[24, 48, 72].map(h => (
              <button
                key={h}
                type="button"
                onClick={() => setDurationHours(h)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  durationHours === h
                    ? 'bg-rose-500/30 border-rose-400 text-rose-200 shadow-sm'
                    : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {h} Giờ ({h / 24} ngày)
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-white/50">Hoặc tùy chỉnh số giờ:</span>
            <input
              type="number"
              min="1"
              max="720"
              value={durationHours}
              onChange={e => setDurationHours(Math.max(1, Number(e.target.value)))}
              className="w-24 px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono font-bold focus:outline-none focus:border-rose-400"
            />
            <span className="text-xs text-white/50">giờ</span>
          </div>
        </div>

        {/* Notice Message */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-white/80">
            Lý do xóa & thông báo toàn server <span className="text-rose-400">*</span>:
          </label>
          <textarea
            rows={3}
            value={notice}
            onChange={e => setNotice(e.target.value)}
            placeholder="Ví dụ: Vật phẩm ngừng phát hành theo kế hoạch mùa giải mới. Toàn bộ người chơi sở hữu sẽ được hệ thống tự động hoàn trả 100% VIP Coin khi hết thời gian đếm ngược."
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-rose-400"
          />
        </div>

        {/* Auto-Refund Guarantee Banner */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
          <Icon name="verified_user" className="text-amber-400 text-base shrink-0 mt-0.5" />
          <span>
            <strong>Cơ chế tự động hoàn tiền:</strong> Khi hết thời gian đếm ngược hoặc khi Admin bấm tiêu hủy, hệ thống sẽ tự động cộng thẳng 100% số VIP Coin gốc vào Ví của toàn bộ người chơi đã mua vật phẩm này mà người chơi không cần phải viết ticket thủ công.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" disabled={loading} onClick={onClose}>
            Hủy Bỏ
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={loading}
            onClick={handleConfirm}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-950"
          >
            Kích Hoạt Lên Lịch Xóa
          </Button>
        </div>
      </div>
    </div>
  )
}

