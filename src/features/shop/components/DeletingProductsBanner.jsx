import { useState, useEffect } from 'react'
import { Icon } from '@/shared/ui'
import { getDeletingAnnouncements } from '@/features/admin/shop/services/adminShopService'

function formatCountdown(targetDate) {
  if (!targetDate) return null
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return 'Removing…'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default function DeletingProductsBanner() {
  const [announcements, setAnnouncements] = useState([])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    let disposed = false
    async function load() {
      try {
        const res = await getDeletingAnnouncements()
        const items = res?.data || res?.result || []
        if (!disposed && Array.isArray(items)) {
          setAnnouncements(items)
        }
      } catch {
        // silent fail
      }
    }
    load()
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => {
      disposed = true
      clearInterval(timer)
    }
  }, [])

  if (!announcements || announcements.length === 0) return null

  return (
    <div className="space-y-3 mb-6">
      {announcements.map(item => {
        const countdownStr = formatCountdown(item.deletionScheduledAt)

        return (
          <div
            key={item.id}
            role="status"
            className="p-4 rounded-2xl bg-error-container/25 border border-error/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-error/15 text-error flex items-center justify-center shrink-0">
                <Icon name="local_fire_department" className="text-xl" />
              </span>

              {item.previewUrl && (
                <div className="w-12 h-12 rounded-xl bg-surface-container-lowest border border-outline-variant/40 p-1 shrink-0 overflow-hidden">
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    onError={e => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">Removal notice · {item.name}</p>
                <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
                  {item.deletionNotice ||
                    'This item is counting down to permanent removal.'}{' '}
                  <strong className="font-semibold text-on-surface">
                    Every owner automatically gets 100% of the original VIP Coin back when it ends.
                  </strong>
                </p>
              </div>
            </div>

            <div className="shrink-0 self-end md:self-center text-right">
              <span className="block text-xs text-on-surface-variant">Time until removal</span>
              <span className="font-label-numeric-md text-label-numeric-md text-error tabular-nums">{countdownStr}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
