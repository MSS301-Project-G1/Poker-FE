import { useState, useEffect } from 'react'
import { Icon } from '@/shared/ui'
import { getDeletingAnnouncements } from '@/features/admin/shop/services/adminShopService'

function formatCountdown(targetDate) {
  if (!targetDate) return null
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return 'Đang xử lý tiêu hủy...'

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
            className="p-4 rounded-3xl bg-gradient-to-r from-rose-950/80 via-[#1e0a2b] to-black/90 border border-rose-500/40 shadow-2xl relative overflow-hidden animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Ambient fire glow */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-rose-600/15 to-transparent pointer-events-none" />

            <div className="flex items-center gap-3.5 relative z-10">
              <span className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950 animate-pulse">
                <Icon name="local_fire_department" className="text-2xl" />
              </span>

              {item.previewUrl && (
                <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 p-1 shrink-0 overflow-hidden">
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

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm">
                    Thông Báo Tiêu Hủy
                  </span>
                  <span className="text-xs text-rose-200/80 font-bold truncate">
                    Vật phẩm: {item.name}
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-1 max-w-xl">
                  {item.deletionNotice ||
                    'Vật phẩm đang trong tiến trình đếm ngược xóa vĩnh viễn khỏi toàn bộ hệ thống.'}{' '}
                  <strong className="text-amber-300">
                    Toàn bộ tài khoản sở hữu sẽ được hệ thống TỰ ĐỘNG hoàn lại 100% VIP Coin gốc vào Ví khi kết thúc.
                  </strong>
                </p>
              </div>
            </div>

            {/* Countdown box */}
            <div className="flex items-center gap-3 shrink-0 relative z-10 self-end md:self-center">
              <div className="px-4 py-2 rounded-2xl bg-black/60 border border-rose-500/30 flex items-center gap-2 shadow-inner">
                <Icon name="timer" className="text-rose-400 text-base animate-pulse" />
                <div className="text-right">
                  <span className="text-[10px] text-white/50 block font-semibold uppercase tracking-wider">
                    Thời gian xóa còn lại
                  </span>
                  <span className="font-mono font-black text-rose-300 text-sm tracking-widest">
                    {countdownStr}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

