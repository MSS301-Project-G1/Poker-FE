import { Icon } from '@/shared/ui'

// Demo standings until the ranking service is connected.
const players = [
  { name: 'DragonAce', title: 'Poker God', winnings: '+142.5M', winRate: '74%', avatar: '/stitch-assets/lobby-checkin-avatar-en.png',
    badge: 'bg-tertiary text-on-tertiary shadow-md', accent: 'text-tertiary' },
  { name: 'VioletQueen', title: 'Grandmaster', winnings: '+98.2M', winRate: '71%', avatar: '/stitch-assets/lobby-woman-avatar.jpg',
    badge: 'bg-secondary text-on-secondary', accent: 'text-secondary' },
  { name: 'BluffKing', title: 'Master', winnings: '+64.8M', winRate: '65%', avatar: '/stitch-assets/lobby-cyber-avatar.jpg',
    badge: 'bg-tertiary-container text-on-tertiary', accent: 'text-primary' },
  { name: 'CyberFlush', title: 'Expert', winnings: '+41.2M', winRate: '62%', avatar: '/stitch-assets/lobby-leaderboard-avatar.jpg',
    badge: 'bg-surface-container-high text-on-surface', accent: 'text-on-surface', muted: true },
  { name: 'RoyalShadow', title: 'Platinum', winnings: '+32.9M', winRate: '59%', avatar: '/stitch-assets/lobby-cyber-avatar.jpg',
    badge: 'bg-surface-container-high text-on-surface', accent: 'text-on-surface', muted: true },
]

export default function Leaderboard({ collapsed = false, onToggleCollapse }) {
  if (collapsed) {
    return <div className="h-full flex flex-col items-center justify-between py-space-md px-2 bg-surface-container-lowest/25 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transition-all duration-300">
      <button
        type="button"
        onClick={onToggleCollapse}
        className="w-9 h-9 rounded-full bg-primary/20 hover:bg-primary/40 flex items-center justify-center text-primary transition-all border border-primary/30"
        title="Mở rộng bảng xếp hạng"
        aria-label="Mở rộng bảng xếp hạng"
      >
        <Icon name="chevron_left" className="text-xl" />
      </button>
      <div className="flex flex-col items-center gap-2 py-4">
        <Icon name="military_tech" filled className="text-tertiary text-xl" />
        <span className="[writing-mode:vertical-rl] text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Leaderboard
        </span>
      </div>
      <div className="w-8 h-8 rounded-full bg-primary-container/40 flex items-center justify-center text-[11px] font-bold text-primary border border-primary/30">
        #128
      </div>
    </div>
  }

  return <div className="h-full flex flex-col gap-space-md bg-surface-container-lowest/30 backdrop-blur-md p-space-md rounded-2xl border border-amber-400/20 shadow-2xl relative overflow-hidden [transform-style:preserve-3d] lg:[transform:perspective(1200px)_rotateY(-12deg)_rotateX(4deg)_translateZ(0)] lg:hover:[transform:perspective(1200px)_rotateY(0deg)_rotateX(0deg)_translateZ(40px)_scale(1.02)] transition-all duration-500 ease-out hover:border-amber-400/60 hover:shadow-[0_24px_60px_-10px_rgba(0,0,0,0.85),0_0_30px_rgba(245,196,80,0.3)] will-change-transform z-20">
    <div className="flex items-center justify-between pb-space-xs">
      <div className="flex items-center gap-space-xs">
        <Icon name="military_tech" filled className="text-tertiary text-xl" />
        <h3 className="font-headline-sm text-headline-sm text-on-surface">Leaderboard</h3>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-label-micro font-label-micro uppercase tracking-wider text-primary bg-primary-container/30 px-2 py-0.5 rounded-full border border-primary/20">This Week</span>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-on-surface-variant hover:text-white transition-all border border-white/10"
            title="Thu gọn bảng xếp hạng để xem toàn cảnh bàn 3D"
            aria-label="Thu gọn bảng xếp hạng"
          >
            <Icon name="chevron_right" className="text-base" />
          </button>
        )}
      </div>
    </div>

    <div className="flex-1 flex flex-col gap-space-xs">
      {players.map((player, index) => <div key={player.name} className="flex-1 flex items-center justify-between p-space-sm rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-primary/40 backdrop-blur-sm transition-all duration-200">
        <div className="flex items-center gap-space-sm">
          <div className={`w-7 h-7 rounded-full ${player.badge} flex items-center justify-center font-label-numeric-md text-label-numeric-md`}>{index + 1}</div>
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
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

    <div className="p-space-sm bg-gradient-to-r from-primary-container/20 to-secondary-container/15 border border-primary/20 rounded-xl backdrop-blur-sm flex items-center justify-between">
      <div className="flex items-center gap-space-xs">
        <span className="font-label-numeric-md text-label-numeric-md text-primary">Rank #128</span>
        <span className="text-body-sm font-body-sm text-on-surface-variant">(You)</span>
      </div>
      <span className="font-label-numeric-md text-label-numeric-md text-tertiary">+12,500,000</span>
    </div>
  </div>
}
