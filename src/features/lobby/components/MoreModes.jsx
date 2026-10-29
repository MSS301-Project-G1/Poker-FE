import { Link } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'

/** tutorial: useTutorialStatus() status from the tutorial feature; null while unknown, which hides the reward. */
export default function MoreModes({ tutorial, collapsed = false }) {
  const reward = tutorial && !tutorial.completed ? `+${tutorial.rewardCoins.toLocaleString()} xu` : null
  const modes = [
    { to: paths.rooms, icon: 'meeting_room', title: 'Phòng riêng', text: 'Mở bàn với bạn bè · không tính Elo' },
    { to: paths.tournaments, icon: 'emoji_events', title: 'Giải đấu', text: 'Giải Mở và Giải Cao thủ có thưởng' },
    { to: paths.tutorial, icon: 'school', title: 'Hướng dẫn', text: 'Học luật qua 2 ván mẫu', badge: reward },
  ]

  if (collapsed) {
    return <nav aria-label="Chế độ khác" className="flex flex-col items-center gap-2 py-space-sm px-2 bg-surface-container-lowest/25 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
      {modes.map(mode => <Link key={mode.to} to={mode.to} title={mode.badge ? `${mode.title} (${mode.badge})` : mode.title} aria-label={mode.title}
        className="relative w-9 h-9 rounded-full bg-primary/15 hover:bg-primary/35 flex items-center justify-center text-primary border border-primary/25 transition-all">
        <Icon name={mode.icon} className="text-lg" />
        {mode.badge && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-tertiary" aria-hidden="true" />}
      </Link>)}
    </nav>
  }

  return <nav aria-label="Chế độ khác" className="flex flex-col gap-space-xs bg-surface-container-lowest/30 backdrop-blur-md p-space-md rounded-2xl border border-white/10 shadow-2xl">
    <h3 className="font-label-micro text-label-micro uppercase tracking-widest text-on-surface-variant">Chế độ khác</h3>
    {modes.map(mode => <Link key={mode.to} to={mode.to} className="flex items-center gap-space-sm p-space-sm rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-primary/40 backdrop-blur-sm transition-all duration-200 group">
      <span className="w-9 h-9 shrink-0 rounded-lg bg-primary-container/30 text-primary flex items-center justify-center"><Icon name={mode.icon} /></span>
      <span className="flex flex-col min-w-0 flex-1">
        <span className="font-label-action text-label-action text-on-surface">{mode.title}</span>
        <span className="font-label-micro text-label-micro text-on-surface-variant truncate">{mode.text}</span>
      </span>
      {mode.badge ? <span className="shrink-0 px-2 py-0.5 rounded-full bg-tertiary-container/60 text-tertiary text-label-micro font-label-micro font-bold">{mode.badge}</span>
        : <Icon name="chevron_right" className="shrink-0 text-on-surface-variant group-hover:text-primary transition-colors" />}
    </Link>)}
  </nav>
}
