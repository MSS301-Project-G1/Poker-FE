import { useState, useMemo } from 'react'
import { Icon, useToast } from '@/shared/ui'
import { formatVipCoin } from '../utils/adminFormatters'
import { scheduleProductDeletion } from '../services/adminShopService'

const PRESET_OPTIONS = [
  { label: '1 minute (test)', value: 1, unit: 'MINUTES' },
  { label: '5 minutes', value: 5, unit: 'MINUTES' },
  { label: '15 minutes', value: 15, unit: 'MINUTES' },
  { label: '1 hour', value: 1, unit: 'HOURS' },
  { label: '24 hours', value: 24, unit: 'HOURS' },
  { label: '72 hours', value: 72, unit: 'HOURS' },
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
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      ' • ' +
      date.toLocaleDateString('en-US')
    )
  }, [effectiveMinutes])

  if (!isOpen || !product) return null

  const handleConfirm = async () => {
    if (!notice.trim()) {
      notify('Enter the reason players will see', { type: 'error' })
      return
    }

    setLoading(true)
    try {
      await scheduleProductDeletion(product.id, {
        durationMinutes: effectiveMinutes,
        durationHours: Math.max(1, Math.round(effectiveMinutes / 60)),
        notice: notice.trim(),
      })
      const displayDuration = unit === 'HOURS' ? `${durationValue} hours` : `${durationValue} minutes`
      notify(
        `“${product.name}” will be deleted in ${displayDuration}.`,
        { type: 'success' }
      )
      onSuccess?.()
      onClose()
    } catch (err) {
      notify(err.message || 'Couldn’t schedule the deletion', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-obsidian/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-background border border-error/40 p-6 sm:p-8 shadow-raised space-y-5 text-white my-auto">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/10">
          <span className="w-14 h-14 rounded-2xl bg-error/30 text-error border border-error/40 flex items-center justify-center shrink-0 shadow-lg">
            <Icon name="timer" className="text-3xl" />
          </span>
          <div>
            <h3 className="font-headline font-bold text-xl sm:text-2xl text-white">
              Schedule deletion
            </h3>
            <p className="text-sm text-error/90 mt-0.5 leading-relaxed">
              Players see a public countdown before the product is deleted, and{' '}
              <strong className="text-tertiary-fixed">100% is refunded automatically</strong> to every owner
            </p>
          </div>
        </div>

        {/* Product summary card */}
        <div className="p-4 rounded-2xl bg-obsidian/50 border border-white/10 flex items-center gap-4 shadow-inner">
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
              <span className="text-sm text-tertiary font-mono font-bold">
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
              <Icon name="schedule" className="text-error text-base" />
              <span>Countdown:</span>
            </label>
            <div className="text-xs sm:text-sm text-tertiary-fixed font-semibold bg-tertiary/10 px-3 py-1 rounded-xl border border-tertiary/25 inline-flex items-center gap-1.5 self-start sm:self-auto">
              <Icon name="alarm_on" className="text-tertiary text-sm" />
              <span>Deletes at: <strong>{expectedTimeStr}</strong></span>
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
                      ? 'bg-error/30 border-error text-error shadow-lg ring-2 ring-error/50'
                      : 'bg-obsidian/40 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Custom value and unit selector */}
          <div className="mt-2 flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-obsidian/40 border border-white/10">
            <span className="text-sm text-white/80 font-medium">Or custom:</span>
            <input
              type="number"
              min="1"
              max={unit === 'HOURS' ? 720 : 43200}
              value={durationValue}
              onChange={e => setDurationValue(Math.max(1, Number(e.target.value)))}
              className="w-28 px-3.5 py-2 rounded-xl bg-obsidian/70 border border-white/20 text-sm text-white font-mono font-bold focus:outline-none focus:border-error text-center"
            />
            <select
              value={unit}
              onChange={e => setUnit(e.target.value)}
              className="px-4 py-2 rounded-xl bg-obsidian/70 border border-white/20 text-sm text-white font-bold focus:outline-none focus:border-error cursor-pointer"
            >
              <option value="MINUTES">Minutes</option>
              <option value="HOURS">Hours</option>
            </select>
            <span className="text-sm text-white/60 font-mono ml-auto">
              (Total: <strong className="text-white font-bold">{effectiveMinutes} minutes</strong>)
            </span>
          </div>
        </div>

        {/* Notice Message */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-white">
              Reason and server-wide notice <span className="text-error">*</span>:
            </label>
            <span className="text-xs text-white/40">Shown in the shop and inventories</span>
          </div>
          <textarea
            rows={3}
            value={notice}
            onChange={e => setNotice(e.target.value)}
            placeholder="e.g. Retired for the new season. Every owner gets 100% of their VIP Coin back when the countdown ends."
            className="w-full px-4 py-3 rounded-2xl bg-obsidian/60 border border-white/15 text-white placeholder-white/35 text-sm leading-relaxed focus:outline-none focus:border-error focus:ring-2 focus:ring-error/30 transition-all"
          />
        </div>

        {/* Auto-Refund Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-tertiary/10 border border-tertiary/25 text-sm text-tertiary-fixed/95 flex items-start gap-3">
          <Icon name="verified_user" className="text-tertiary text-xl shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-tertiary-fixed font-bold block mb-0.5">
              Automatic 100% VIP Coin refund:
            </strong>
            When the countdown ends, or an admin deletes it immediately, every owner automatically gets 100% of the original VIP Coin back. No ticket needed.
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Destroy-now button */}
          {onImmediateDelete ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => onImmediateDelete(product)}
              className="px-4 py-3 rounded-2xl bg-error-container/60 hover:bg-error-container text-error hover:text-white border border-error/50 hover:border-error font-headline font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.98] group"
              title="Skip the countdown: delete now and refund players immediately"
            >
              <span className="w-6 h-6 rounded-lg bg-error/30 flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                <Icon name="delete_forever" className="text-base text-error" />
              </span>
              <span>Delete now</span>
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
              Cancel
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleConfirm}
              className="px-6 py-3 rounded-2xl bg-error-container hover:bg-error-container/80 text-white font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-raised transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="timer" className="text-lg" />
              )}
              <span>Schedule deletion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
