import { Link } from 'react-router'
import { tiers } from '@/features/ranking'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'

// Podium colours for places 1–3; everyone below shares the muted row.
const podium = [
  { badge: 'bg-tertiary text-on-tertiary shadow-md', accent: 'text-tertiary' },
  { badge: 'bg-secondary text-on-secondary', accent: 'text-secondary' },
  { badge: 'bg-tertiary-container text-on-tertiary', accent: 'text-primary' },
]
const rest = { badge: 'bg-surface-container-high text-on-surface', accent: 'text-on-surface', muted: true }
const fallbackAvatar = '/stitch-assets/avatar.svg'

/** standings: useLeaderboardPreview() from the ranking feature (season top and the player's own standing). */
export default function Leaderboard({ standings, collapsed = false, onToggleCollapse }) {
  const { phase, season, top, me, profiles } = standings
  const position = me?.position ? `#${me.position.toLocaleString()}` : '—'
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
      <div className="w-8 h-8 rounded-full bg-primary-container/40 flex items-center justify-center text-[11px] font-bold text-primary border border-primary/30" title="Your position">
        {position}
      </div>
    </div>
  }

  return <div className="h-full flex flex-col gap-space-md bg-surface-container-lowest/30 backdrop-blur-md p-space-md rounded-2xl border border-amber-400/20 shadow-2xl relative overflow-hidden [transform-style:preserve-3d] lg:[transform:perspective(1200px)_rotateY(-12deg)_rotateX(4deg)_translateZ(0)] lg:hover:[transform:perspective(1200px)_rotateY(0deg)_rotateX(0deg)_translateZ(40px)_scale(1.02)] transition-all duration-500 ease-out hover:border-amber-400/60 hover:shadow-[0_24px_60px_-10px_rgba(0,0,0,0.85),0_0_30px_rgba(245,196,80,0.3)] will-change-transform z-20">
    <div className="flex items-center justify-between pb-space-xs">
      <Link to={paths.ranking} className="flex items-center gap-space-xs hover:text-primary transition-colors" title="Mở bảng xếp hạng đầy đủ">
        <Icon name="military_tech" filled className="text-tertiary text-xl" />
        <h3 className="font-headline-sm text-headline-sm text-on-surface">Leaderboard</h3>
      </Link>
      <div className="flex items-center gap-2">
        <span className="text-label-micro font-label-micro uppercase tracking-wider text-primary bg-primary-container/30 px-2 py-0.5 rounded-full border border-primary/20">{season?.name || 'Season'}</span>
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
      {phase === 'loading' && Array.from({ length: 5 }, (_, index) => <div key={index} role={index ? undefined : 'status'} aria-label={index ? undefined : 'Đang tải bảng xếp hạng'}
        className="flex-1 min-h-12 rounded-xl bg-white/[0.04] border border-white/[0.05] animate-pulse motion-reduce:animate-none" />)}
      {phase === 'error' && <p role="alert" className="text-body-sm font-body-sm text-error">{standings.error}</p>}
      {phase === 'empty' && <p className="text-body-sm font-body-sm text-on-surface-variant">Chưa ai đánh Rank trong mùa này. Hãy là người đầu tiên!</p>}
      {phase === 'ready' && top.map((player, index) => {
        const style = podium[index] || rest
        const profile = profiles[player.accountId]
        const name = profile?.displayName || `Player ${player.accountId.slice(-6)}`
        const you = player.accountId === me?.accountId
        return <div key={player.accountId} className={`flex-1 flex items-center justify-between p-space-sm rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border ${you ? 'border-primary/50' : 'border-white/[0.05]'} hover:border-primary/40 backdrop-blur-sm transition-all duration-200`}>
          <div className="flex items-center gap-space-sm min-w-0">
            <div className={`w-7 h-7 shrink-0 rounded-full ${style.badge} flex items-center justify-center font-label-numeric-md text-label-numeric-md`}>{player.position}</div>
            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
              <img alt={`${name} avatar`} className="w-full h-full object-cover" src={profile?.avatarUrl || fallbackAvatar}
                onError={event => { event.currentTarget.src = fallbackAvatar }} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-action text-label-action text-on-surface truncate w-24" title={name}>{name}{you && ' (You)'}</span>
              <span className={`font-label-micro text-label-micro ${style.muted ? 'text-on-surface-variant' : style.accent}`}>{tiers[player.tier]?.label || player.tier}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`font-label-numeric-md text-label-numeric-md ${style.accent}`}>{player.elo.toLocaleString()} Elo</div>
            <div className="font-label-micro text-label-micro text-on-surface-variant">Streak {player.winStreak}</div>
          </div>
        </div>
      })}
    </div>

    {me && <Link to={paths.ranking} className="p-space-sm bg-gradient-to-r from-primary-container/20 to-secondary-container/15 border border-primary/20 hover:border-primary/50 rounded-xl backdrop-blur-sm flex items-center justify-between transition-colors">
      <div className="flex items-center gap-space-xs">
        <span className="font-label-numeric-md text-label-numeric-md text-primary">{me.position ? `Rank ${position}` : 'Unranked'}</span>
        <span className="text-body-sm font-body-sm text-on-surface-variant">(You)</span>
      </div>
      <span className="font-label-numeric-md text-label-numeric-md text-tertiary">{me.elo.toLocaleString()} Elo</span>
    </Link>}
  </div>
}
