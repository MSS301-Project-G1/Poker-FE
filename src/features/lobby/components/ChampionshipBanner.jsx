import { Icon } from '@/shared/ui'
import GameModeBanner from './GameModeBanner'

export default function ChampionshipBanner() {
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
      <button type="button" className="w-full md:w-auto shrink-0 px-space-lg py-space-sm bg-gradient-to-r from-tertiary-container to-tertiary text-on-tertiary font-label-action text-label-action rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-space-xs">
        <Icon name="emoji_events" />
        <span>REGISTER (100K)</span>
      </button>
    </div>
  </GameModeBanner>
}
