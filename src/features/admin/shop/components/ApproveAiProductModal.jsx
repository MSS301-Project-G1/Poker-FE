import { useState, useEffect } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { formatVipCoin, formatVnd } from '../utils/adminFormatters'
import { applyAiBatch } from '../services/adminShopService'

export default function ApproveAiProductModal({
  isOpen,
  onClose,
  batch,
  categories = [],
  currentCategoryCode = 'DEALER',
  onSuccess,
}) {
  const notify = useToast()

  // Selected Category ID
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [productName, setProductName] = useState('')
  const [tier, setTier] = useState('VIP')
  const [priceVipCoin, setPriceVipCoin] = useState(150)
  const [priceVnd, setPriceVnd] = useState(150000)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form when batch opens
  useEffect(() => {
    if (!isOpen || !batch) return

    // Find default category matching batch categoryCode or currentCategoryCode
    const targetCode = (batch.categoryCode || currentCategoryCode || 'DEALER').toUpperCase()
    const matchedCategory = categories.find(c => c.code.toUpperCase() === targetCode) || categories[0]
    if (matchedCategory) {
      setSelectedCategoryId(matchedCategory.id)
    }

    if (targetCode === 'DEALER') {
      setProductName('Cô Em Chia Bài Sexy Nơ Hồng (AI)')
      setDescription('Cô em chia bài phong cách sòng bài quý tộc VIP sinh bởi AI Gemini 1.5 Pro với 4 tư thế hành động: Đứng chờ, Chia bài, Lật bài và Ăn mừng.')
      setPriceVipCoin(150)
      setPriceVnd(150000)
      setTier('VIP')
    } else if (targetCode === 'CARD_SKIN') {
      setProductName('Bộ Bài Nghệ Thuật Hoàng Gia (AI)')
      setDescription('Bộ bài tây 52 lá dát vàng sang trọng kèm mặt lưng VIP và hiệu ứng lật bài độc quyền.')
      setPriceVipCoin(200)
      setPriceVnd(200000)
      setTier('SUPER_VIP')
    } else {
      setProductName(`Vật Phẩm AI #${batch.batchId?.substring(0, 6)}`)
      setDescription('Vật phẩm trang trí bàn cược poker tạo bởi hệ thống AI Generator.')
      setPriceVipCoin(100)
      setPriceVnd(100000)
      setTier('VIP')
    }
  }, [isOpen, batch, categories, currentCategoryCode])

  if (!isOpen || !batch) return null

  const handlePriceVipCoinChange = val => {
    const vip = Math.max(0, Number(val) || 0)
    setPriceVipCoin(vip)
    setPriceVnd(vip * 1000)
  }

  const handlePriceVndChange = val => {
    const vnd = Math.max(0, Number(val) || 0)
    setPriceVnd(vnd)
    setPriceVipCoin(Math.round(vnd / 1000))
  }

  const handleConfirmApproval = async () => {
    if (!productName.trim()) {
      notify('Vui lòng nhập tên sản phẩm', { type: 'error' })
      return
    }
    if (!selectedCategoryId) {
      notify('Vui lòng chọn danh mục cho sản phẩm', { type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      await applyAiBatch(batch.batchId, {
        categoryId: selectedCategoryId,
        productName: productName.trim(),
        priceVipCoin,
        priceVnd,
      })

      notify('🎉 Đã phê duyệt và đưa vật phẩm vào Cửa Hàng thành công!', { type: 'success' })
      onSuccess?.()
      onClose()
    } catch (err) {
      notify(err.message || 'Phê duyệt thất bại', { type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const poseUrls = batch.poseUrls || {}
  const poses = [
    { key: 'idle', label: '1. Đứng Chờ', url: poseUrls.idle || batch.s3PreviewUrl },
    { key: 'deal', label: '2. Chia Bài', url: poseUrls.deal },
    { key: 'flip', label: '3. Lật Bài', url: poseUrls.flip },
    { key: 'win', label: '4. Ăn Mừng', url: poseUrls.win },
  ].filter(p => Boolean(p.url))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-[#140a28] border border-amber-500/50 shadow-2xl p-6 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Icon name="verified" className="text-2xl" />
            </span>
            <div>
              <h3 className="font-headline font-black text-lg text-white">
                Phê Duyệt & Đưa Vào Cửa Hàng (Shop Approval)
              </h3>
              <p className="text-xs text-white/50">
                Xác nhận thông tin sản phẩm và phân loại trước khi mở bán chính thức
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all"
          >
            <Icon name="close" className="text-base" />
          </button>
        </div>

        {/* 4 Poses Mini Preview Showcase */}
        {poses.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Icon name="check_circle" className="text-sm text-emerald-400" />
                <span>Các tư thế đã được AI kết xuất thành công ({poses.length} tư thế):</span>
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                Batch #{batch.batchId?.substring(0, 8)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {poses.map(p => (
                <div
                  key={p.key}
                  className="rounded-xl overflow-hidden bg-black/60 border border-amber-400/30 flex flex-col items-center p-1"
                >
                  <img
                    src={p.url}
                    alt={p.label}
                    className="w-full h-16 object-cover rounded-lg"
                  />
                  <span className="text-[10px] text-white/80 font-bold mt-1 truncate">
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Details */}
        <div className="space-y-4 text-xs">
          {/* Row 1: Product Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-white/80 block mb-1">
                Tên sản phẩm mở bán: <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Cô Em Chia Bài Sexy Nơ Hồng (AI)"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-white/80 block mb-1">
                Danh mục hiển thị (Category): <span className="text-amber-400">*</span>
              </label>
              <select
                value={selectedCategoryId}
                onChange={e => setSelectedCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1b0d36] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                {categories.map(c => (
                  <option key={c.id || c.code} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Tier */}
          <div>
            <label className="font-bold text-white/80 block mb-1.5">
              Phân hạng vật phẩm (Tier):
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'NORMAL', label: 'STANDARD', desc: 'Vật phẩm phổ thông' },
                { id: 'VIP', label: 'VIP', desc: 'Hiệu ứng & Ánh kim' },
                { id: 'SUPER_VIP', label: 'SUPER VIP', desc: 'Huyền thoại tối thượng' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTier(t.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    tier === t.id
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                      : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  <span className="font-black text-xs block">{t.label}</span>
                  <span className="text-[10px] text-white/40 block">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-white/80 block mb-1">
                Giá bán VIP Coin (Trong Game):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={priceVipCoin}
                  onChange={e => handlePriceVipCoinChange(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <Icon
                  name="paid"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 text-base pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-white/80 block mb-1">
                Giá niêm yết tương đương (VND):
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={priceVnd}
                onChange={e => handlePriceVndChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-white/40 mt-1 block">
                Tương đương: {formatVnd(priceVnd)}
              </span>
            </div>
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="font-bold text-white/80 block mb-1">
              Mô tả chi tiết hiển thị tại Shop:
            </label>
            <textarea
              rows={2}
              maxLength={300}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-black/50 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy Bỏ / Xem Lại
          </Button>
          <Button
            variant="gold"
            size="md"
            icon="verified"
            loading={isSubmitting}
            onClick={handleConfirmApproval}
          >
            {isSubmitting ? 'Đang Đưa Lên Cửa Hàng...' : 'Xác Nhận Đưa Lên Cửa Hàng'}
          </Button>
        </div>
      </div>
    </div>
  )
}
