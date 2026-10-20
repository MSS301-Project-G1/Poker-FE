import { Icon } from '@/shared/ui'

export default function PlayerSummary({ player, onOpenCheckIn }) {
  const displayName = player?.displayName || player?.email || 'Player'
  const avatarUrl = player?.avatarUrl || '/stitch-assets/avatar.svg'
  return <div className="flex flex-col md:flex-row items-center justify-between gap-space-md bg-surface-container-low/70 backdrop-blur-xl p-space-md rounded-xl shadow-lg relative overflow-hidden">
    <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
    <div className="flex items-center gap-space-md z-10 w-full md:w-auto">
      <div className="relative shrink-0">
        <img alt={displayName} className="w-14 h-14 rounded-xl object-cover shadow-md" src={avatarUrl}
          onError={event => { event.currentTarget.src = '/stitch-assets/avatar.svg' }} />
      </div>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-space-xs">
          <span className="font-headline-sm text-headline-sm text-on-surface truncate">{displayName}</span>
          <Icon name="verified" filled className="text-tertiary text-sm" />
        </div>
        <div className="flex items-center gap-space-sm text-body-sm font-body-sm text-on-surface-variant">
          <span>Win Rate: <strong className="text-tertiary font-label-numeric-md">68.4%</strong></span>
          <span className="text-outline-variant">•</span>
          <span>Best Hand: <strong className="text-primary font-label-numeric-md">Royal Flush</strong></span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-space-sm w-full md:w-auto justify-end z-10">
      <button type="button" onClick={onOpenCheckIn} className="flex items-center gap-space-xs px-space-md py-space-sm bg-gradient-to-r from-primary-container to-secondary-container rounded-lg text-on-primary font-label-action text-label-action shadow-md hover:brightness-110 active:scale-98 transition-all">
        <Icon name="calendar_month" filled className="text-tertiary text-lg animate-bounce" />
        <span>Daily Check-in</span>
        <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse ml-1"></span>
      </button>
      <button type="button" className="flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-high rounded-lg text-on-surface font-label-action text-label-action hover:bg-surface-variant transition-all">
        <Icon name="history_edu" className="text-primary text-lg" />
        <span className="hidden sm:inline">History Log</span>
      </button>
    </div>
  </div>
}
