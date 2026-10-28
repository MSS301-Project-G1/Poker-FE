import { useRef, useState } from 'react'
import { Icon } from '@/shared/ui'
import GameModeBanner from './GameModeBanner'

export default function ChampionshipBanner() {
  const [hidden, setHidden] = useState(false)
  const restoreButton = useRef(null)
  const closeButton = useRef(null)
  const toggleBanner = hide => {
    setHidden(hide)
    requestAnimationFrame(() => (hide ? restoreButton : closeButton).current?.focus())
  }
  if (hidden) return <div className="flex justify-end">
    <button ref={restoreButton} type="button" onClick={() => toggleBanner(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors" aria-label="Hiện giải đấu">
      <Icon name="emoji_events" className="text-base" />Hiện giải đấu
    </button>
  </div>
  return <GameModeBanner image="/stitch-assets/lobby-championship-en.png" veil="via-surface-container-lowest/80 to-surface-container-lowest/30">
    <div className="relative h-full px-space-lg py-space-md flex flex-col md:flex-row justify-between items-start md:items-center gap-space-md">
      <div className="flex flex-col gap-space-xs min-w-0">
        <div className="flex flex-wrap items-center gap-space-xs">
          <span className="px-2 py-0.5 rounded-full bg-tertiary-container/60 text-tertiary text-label-micro font-label-micro font-bold uppercase">MAJOR EVENT</span>
          <span className="text-primary text-label-micro font-label-micro">Texas Hold&apos;em Masters S6</span>
          <span className="flex items-center gap-space-xs bg-surface-container-lowest/80 backdrop-blur-md px-space-sm py-0.5 rounded-lg">
            <Icon name="timer" className="text-error text-sm animate-pulse" />
            <span className="text-on-surface font-label-numeric-md text-label-numeric-md tracking-wider">01:42:18</span>
            <span className="text-on-surface-variant text-label-micro font-label-micro">until registration closes</span>
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-space-md gap-y-space-xs">
          <h2 className="font-headline-md text-headline-md text-tertiary drop-shadow-md">CHAMPIONSHIP TOURNAMENT</h2>
          <span className="text-on-surface-variant font-body-sm text-body-sm">Total Prize Pool: <strong className="font-label-numeric-md text-label-numeric-md text-tertiary">50,000,000 CHIPS</strong></span>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
      <button type="button" className="flex-1 md:flex-none shrink-0 px-space-lg py-space-sm bg-gradient-to-r from-tertiary-container to-tertiary text-on-tertiary font-label-action text-label-action rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-space-xs">
        <Icon name="emoji_events" />
        <span>REGISTER (100K)</span>
      </button>
      <button ref={closeButton} type="button" onClick={() => toggleBanner(true)} aria-label="Ẩn banner giải đấu" title="Ẩn banner giải đấu" className="w-9 h-9 shrink-0 grid place-items-center rounded-full border border-white/10 bg-white/5 text-on-surface-variant hover:bg-white/10 hover:text-white transition-colors">
        <Icon name="close" className="text-lg" />
      </button>
      </div>
    </div>
  </GameModeBanner>
}
