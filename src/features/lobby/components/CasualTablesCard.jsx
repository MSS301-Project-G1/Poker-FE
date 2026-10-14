import { Icon } from '@/shared/ui'
import GameModeBanner from './GameModeBanner'

// Demo stakes until the room service provides them.
const stakes = [
  { tier: 'Beginner', blinds: '1K / 2K', buyIn: '40K' },
  { tier: 'Intermediate', blinds: '10K / 20K', buyIn: '400K' },
  { tier: 'High Roller', blinds: '100K / 200K', buyIn: '4M' },
  { tier: 'Master', blinds: '1M / 2M', buyIn: '40M', highlight: true },
]

export default function CasualTablesCard({ onQuickPlay }) {
  return <GameModeBanner image="/stitch-assets/lobby-casual-banner.jpg" veil="via-surface-container-lowest/85 to-surface-container-lowest/40">
    <div className="relative p-space-lg flex flex-col gap-space-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs">
        <div>
          <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-label-micro font-label-micro uppercase tracking-wider">Free Play • Casual</span>
          <h2 className="font-headline-lg text-headline-lg text-secondary mt-1">ROUND TABLE CASUAL</h2>
        </div>
        <div className="flex items-center gap-space-xs bg-surface-container-high/80 px-space-sm py-1 rounded-full text-on-surface-variant text-label-micro font-label-micro">
          <span className="w-2 h-2 rounded-full bg-tertiary"></span>
          <span>8,420 Active Tables</span>
        </div>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-lg">Choose a room tailored to your bankroll or create private friendly tables with your crew.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-xs">
        {stakes.map(stake => <button key={stake.tier} type="button" className="flex flex-col items-center justify-center p-space-sm bg-surface-container-low/90 hover:bg-primary-container/40 rounded-lg transition-all group/btn">
          <span className={`font-label-micro text-label-micro ${stake.highlight ? 'text-primary' : 'text-on-surface-variant'}`}>{stake.tier}</span>
          <span className={`font-label-numeric-md text-label-numeric-md mt-0.5 ${stake.highlight ? 'text-primary' : 'text-tertiary'}`}>{stake.blinds}</span>
          <span className="text-on-surface-variant text-[10px]">Buy-in: {stake.buyIn}</span>
        </button>)}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
        <button type="button" className="flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-high hover:bg-surface-variant rounded-lg text-on-surface font-label-action text-label-action transition-all">
          <Icon name="group_add" className="text-secondary" />
          <span>Create Private Room</span>
        </button>
        <button type="button" onClick={onQuickPlay} className="flex items-center gap-space-xs px-space-lg py-space-sm bg-secondary-container hover:bg-primary-container text-on-secondary-container hover:text-on-primary-container font-label-action text-label-action rounded-lg shadow-md transition-all">
          <Icon name="bolt" className="text-lg" />
          <span>QUICK PLAY</span>
        </button>
      </div>
    </div>
  </GameModeBanner>
}
