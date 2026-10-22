import { Icon } from '@/shared/ui'

// Demo standings until the ranking service is connected.
const players = [
  { name: 'DragonAce', title: 'Poker God', winnings: '+142.5M', winRate: '74%', avatar: '/stitch-assets/lobby-checkin-avatar-en.png',
    row: 'bg-surface-container-high/90', badge: 'bg-tertiary text-on-tertiary shadow-md', accent: 'text-tertiary' },
  { name: 'VioletQueen', title: 'Grandmaster', winnings: '+98.2M', winRate: '71%', avatar: '/stitch-assets/lobby-woman-avatar.jpg',
    row: 'bg-surface-container/70', badge: 'bg-secondary text-on-secondary', accent: 'text-secondary' },
  { name: 'BluffKing', title: 'Master', winnings: '+64.8M', winRate: '65%', avatar: '/stitch-assets/lobby-cyber-avatar.jpg',
    row: 'bg-surface-container/70', badge: 'bg-tertiary-container text-on-tertiary', accent: 'text-primary' },
  { name: 'CyberFlush', title: 'Expert', winnings: '+41.2M', winRate: '62%', avatar: '/stitch-assets/lobby-leaderboard-avatar.jpg',
    row: 'bg-surface-container-low/40', badge: 'bg-surface-container-high text-on-surface', accent: 'text-on-surface', muted: true },
  { name: 'RoyalShadow', title: 'Platinum', winnings: '+32.9M', winRate: '59%', avatar: '/stitch-assets/lobby-cyber-avatar.jpg',
    row: 'bg-surface-container-low/40', badge: 'bg-surface-container-high text-on-surface', accent: 'text-on-surface', muted: true },
]

export default function Leaderboard() {
  return <div className="h-full flex flex-col gap-space-md bg-surface-container-low/80 backdrop-blur-xl p-space-md rounded-xl shadow-xl">
    <div className="flex items-center justify-between pb-space-xs">
      <div className="flex items-center gap-space-xs">
        <Icon name="military_tech" filled className="text-tertiary text-xl" />
        <h3 className="font-headline-sm text-headline-sm text-on-surface">Leaderboard</h3>
      </div>
      <span className="text-label-micro font-label-micro uppercase tracking-wider text-primary bg-primary-container/30 px-2 py-0.5 rounded-full">This Week</span>
    </div>

    <div className="flex-1 flex flex-col gap-space-xs">
      {players.map((player, index) => <div key={player.name} className={`flex-1 flex items-center justify-between p-space-sm rounded-lg ${player.row} hover:bg-surface-variant transition-all`}>
        <div className="flex items-center gap-space-sm">
          <div className={`w-7 h-7 rounded-full ${player.badge} flex items-center justify-center font-label-numeric-md text-label-numeric-md`}>{index + 1}</div>
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
            <img alt={`${player.name} avatar`} className="w-full h-full object-cover" src={player.avatar} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-action text-label-action text-on-surface truncate w-24">{player.name}</span>
            <span className={`font-label-micro text-label-micro ${player.muted ? 'text-on-surface-variant' : player.accent}`}>{player.title}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-label-numeric-md text-label-numeric-md ${player.accent}`}>{player.winnings}</div>
          <div className="font-label-micro text-label-micro text-on-surface-variant">Win {player.winRate}</div>
        </div>
      </div>)}
    </div>

    <div className="p-space-sm bg-primary-container/20 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-space-xs">
        <span className="font-label-numeric-md text-label-numeric-md text-primary">Rank #128</span>
        <span className="text-body-sm font-body-sm text-on-surface-variant">(You)</span>
      </div>
      <span className="font-label-numeric-md text-label-numeric-md text-tertiary">+12,500,000</span>
    </div>
  </div>
}
