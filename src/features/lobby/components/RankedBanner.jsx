import { Icon } from '@/shared/ui'
import GameModeBanner from './GameModeBanner'

export default function RankedBanner({ onFindMatch }) {
  return <GameModeBanner image="/stitch-assets/lobby-ranked-banner.jpg" veil="via-surface-container-lowest/80 to-transparent">
    <div className="relative p-space-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-space-md min-h-[220px]">
      <div className="flex flex-col gap-space-xs max-w-md">
        <div className="flex items-center gap-space-xs">
          <span className="px-2 py-0.5 rounded-full bg-primary-container/80 text-on-primary-container text-label-micro font-label-micro tracking-widest uppercase">Season S6</span>
          <span className="text-tertiary text-label-micro font-label-micro flex items-center gap-0.5">
            <Icon name="timer" className="text-xs" /> 12 days left
          </span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-primary tracking-wide drop-shadow-md">GLOBAL RANKED MATCH</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Compete with 50,000 poker champions worldwide. Current: <span className="text-tertiary font-bold">Master II</span> (89/100 Points). Earn Exclusive Badges &amp; 50M Season Reward Chips.</p>
        <div className="w-full bg-surface-container-highest/80 rounded-full h-2 mt-space-xs overflow-hidden">
          <div className="bg-gradient-to-r from-secondary to-primary h-full rounded-full w-[89%]"></div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-space-sm w-full md:w-auto shrink-0">
        <button type="button" onClick={onFindMatch} className="w-full sm:w-auto px-space-xl py-space-md bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary hover:to-secondary-container text-on-primary font-label-action text-label-action rounded-lg shadow-xl shadow-primary-container/30 active:scale-95 transition-all flex items-center justify-center gap-space-xs">
          <Icon name="swords" />
          <span>FIND MATCH NOW</span>
        </button>
      </div>
    </div>
  </GameModeBanner>
}
