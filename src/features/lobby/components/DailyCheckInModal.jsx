import { Icon } from '@/shared/ui'

// Demo streak until the reward service is connected. status: claimed | today | locked
const days = [
  { day: 1, reward: '50K Chips', status: 'claimed', coin: 'text-tertiary/70' },
  { day: 2, reward: '100K Chips', status: 'claimed', coin: 'text-tertiary/70' },
  { day: 3, reward: '150K Chips', status: 'claimed', coin: 'text-primary/70', compact: true },
  { day: 4, reward: '250K Chips', status: 'today' },
  { day: 5, reward: '350K Chips', status: 'locked', coin: 'text-secondary', compact: true },
  { day: 6, reward: '500K Chips', status: 'locked', coin: 'text-tertiary' },
  { day: 7, reward: '1M Chips', status: 'locked', ultimate: true },
]

const coinBox = 'w-14 h-14 my-space-xs flex items-center justify-center relative'

function DayCard({ item, onClaim }) {
  if (item.status === 'today') {
    return <div className="relative flex flex-col items-center justify-between p-space-sm rounded-xl bg-gradient-to-b from-primary-container/80 to-surface-container-high shadow-xl shadow-primary-container/40 ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest scale-105 z-20">
      <div className="absolute -top-3 bg-tertiary text-on-tertiary px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm">TODAY</div>
      <span className="font-label-action text-label-action text-on-primary-container pt-1">Day {item.day}</span>
      <div className={coinBox}>
        <Icon name="monetization_on" filled className="text-5xl text-tertiary drop-shadow-md animate-pulse" />
      </div>
      <span className="font-label-numeric-md text-label-numeric-md text-tertiary font-bold">{item.reward}</span>
      <button type="button" onClick={onClaim} className="mt-2 w-full py-1 bg-gradient-to-r from-tertiary to-tertiary-container hover:brightness-110 text-on-tertiary font-label-action text-label-action rounded-md shadow-md active:scale-95 transition-all text-xs uppercase tracking-wide">
        CLAIM NOW
      </button>
    </div>
  }

  const claimed = item.status === 'claimed'
  const surface = item.ultimate ? 'bg-gradient-to-b from-surface-container to-surface-container-lowest opacity-85'
    : claimed ? 'bg-surface-container/60 opacity-80' : 'bg-surface-container-lowest/60 opacity-60'
  return <div className={`relative flex flex-col items-center justify-between p-space-sm rounded-xl ${surface}`}>
    {item.ultimate && <div className="absolute -top-2 bg-primary-container text-on-primary-container px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">ULTIMATE</div>}
    <span className={`font-label-action text-label-action ${item.ultimate ? 'text-tertiary pt-1' : 'text-on-surface-variant'}`}>Day {item.day}</span>
    <div className={coinBox}>
      <Icon name="toll" filled className={`text-4xl ${item.ultimate ? 'text-tertiary animate-pulse' : item.coin}`} />
      {claimed
        ? <div className="absolute inset-0 bg-surface-container-lowest/70 backdrop-blur-xs rounded-full flex items-center justify-center"><Icon name="check_circle" filled className="text-2xl text-tertiary" /></div>
        : <div className="absolute inset-0 flex items-center justify-center"><Icon name="lock" className="text-xl text-outline-variant" /></div>}
    </div>
    <span className={item.compact ? 'font-label-action text-label-action text-on-surface-variant text-center text-xs'
      : `font-label-numeric-md text-label-numeric-md ${item.ultimate ? 'text-tertiary' : 'text-on-surface-variant'}`}>{item.reward}</span>
    <span className={`text-label-micro font-label-micro mt-1 ${claimed ? 'text-tertiary font-semibold' : 'text-outline'}`}>{claimed ? 'Claimed' : 'Locked'}</span>
  </div>
}

export default function DailyCheckInModal({ onClose, onClaim }) {
  return <div className="fixed inset-0 z-overlay flex items-center justify-center p-space-md bg-surface-container-lowest/80 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="7-day check-in">
    <div className="relative w-full max-w-4xl bg-surface-container-low/95 rounded-2xl shadow-2xl p-space-lg flex flex-col gap-space-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 right-1/4 w-80 h-80 bg-tertiary/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-space-sm">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shadow-lg">
            <Icon name="stars" filled className="text-tertiary text-2xl" />
          </div>
          <div>
            <div className="flex items-center gap-space-xs">
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-wide">7-DAY CHECK-IN</h2>
              <span className="bg-tertiary text-on-tertiary text-label-micro font-label-micro px-2 py-0.5 rounded-full uppercase font-bold">MEGA REWARD</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Check in daily to collect bonus chips</p>
          </div>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors">
          <Icon name="close" className="text-2xl" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-space-sm relative z-10 pt-space-xs">
        {days.map(item => <DayCard key={item.day} item={item} onClaim={onClaim} />)}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs relative z-10">
        <div className="flex items-center gap-space-xs text-body-sm font-body-sm text-on-surface-variant">
          <Icon name="info" className="text-tertiary text-sm" />
          <span>Check-in streak resets if missed 1 day.</span>
        </div>
        <div className="flex items-center gap-space-sm w-full sm:w-auto">
          <button type="button" onClick={onClose} className="w-1/2 sm:w-auto px-space-lg py-space-sm bg-surface-container-high hover:bg-surface-variant text-on-surface-variant rounded-lg font-label-action text-label-action transition-all">
            Later
          </button>
          <button type="button" onClick={onClaim} className="w-1/2 sm:w-auto px-space-xl py-space-sm bg-gradient-to-r from-primary-container via-primary to-secondary-container text-on-primary font-label-action text-label-action rounded-lg shadow-xl shadow-primary-container/40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-space-xs">
            <Icon name="card_giftcard" className="text-tertiary" />
            <span>CLAIM TODAY&apos;S REWARD</span>
          </button>
        </div>
      </div>
    </div>
  </div>
}
