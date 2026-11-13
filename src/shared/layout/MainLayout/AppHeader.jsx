import { Link, NavLink } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'
import { useSound } from '@/shared/audio'

const navItems = [
  { to: paths.lobby, label: 'Lobby' },
  // One page hosts Ranked, Casual and the party room, so the item names the activity rather than one mode.
  { to: paths.ranked, label: 'Matching' },
  // Wide screens only: narrower ones reach these from the lobby (Leaderboard and the other-modes panel).
  { to: paths.rooms, label: 'Rooms', wide: true },
  { to: paths.tournaments, label: 'Tournaments', wide: true },
  { to: paths.ranking, label: 'Leaderboard', wide: true },
  { to: paths.shop, label: 'Shop' },
]

const navClass = ({ isActive }) => `px-space-md py-space-sm font-label-action transition-all ${isActive
  ? 'bg-primary-container text-on-primary-container rounded-lg'
  : 'text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`

const iconButton = 'w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors'

/**
 * coins: the wallet's coin balance, or null while it is not loaded.
 * onOpenCheckIn / onOpenNotifications: open the daily check-in and the notifications panel.
 */
export default function AppHeader({ user, coins, onLogout, logoutPending, onOpenCheckIn, onOpenNotifications }) {
  const { enabled: soundEnabled, toggle: toggleSound } = useSound()
  const displayName = user?.profile?.displayName || user?.email || 'Player'
  const avatarUrl = user?.profile?.avatarUrl || '/stitch-assets/avatar.svg'
  return <header className="fixed top-0 left-0 right-0 z-header bg-surface-container-lowest/98 backdrop-blur-xl border-b border-outline-variant/40 shadow-sm">
    <div className="h-20 w-full px-margin-mobile sm:px-margin flex items-center justify-between gap-space-sm sm:gap-space-md">
      <div className="flex items-center gap-space-lg">
        <Link to={user?.role === 'ADMIN' ? paths.admin : paths.lobby} className="flex items-center gap-space-sm hover:opacity-90 transition-opacity">
          <img alt="" className="h-9 w-9" src="/stitch-assets/logo.svg" />
          <span className="sr-only sm:not-sr-only whitespace-nowrap font-headline-sm text-headline-sm text-on-surface">Poker Rank</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-space-xs">
          {navItems.map(item => <NavLink key={item.to} to={item.to}
            className={state => `${navClass(state)}${item.wide ? ' hidden xl:block' : ''}`}>{item.label}</NavLink>)}
          {user?.role === 'ADMIN' && (
            <NavLink
              to={paths.admin}
              className={state => `${navClass(state)} flex items-center gap-1.5 text-primary hover:text-primary font-semibold`}
            >
              <Icon name="admin_panel_settings" className="text-lg text-primary" />
              <span>Dashboard</span>
            </NavLink>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-space-xs sm:gap-space-md">
        {onOpenCheckIn && <button type="button" onClick={onOpenCheckIn} title="Daily check-in" aria-label="Daily check-in"
          className="flex items-center gap-space-xs h-9 px-space-sm xl:px-space-md rounded-full bg-surface-container text-on-surface font-label-action text-label-action hover:bg-surface-container-high transition-colors">
          <Icon name="calendar_month" filled className="text-tertiary text-lg" />
          <span className="hidden xl:inline">Daily check-in</span>
        </button>}
        {coins != null && <div className="hidden sm:flex items-center bg-surface-container-low px-space-md py-space-xs rounded-full gap-space-xs shadow-inner">
          <Icon name="toll" className="text-tertiary text-lg" />
          <span className="font-label-numeric-md text-label-numeric-md text-tertiary">{coins.toLocaleString()}</span>
        </div>}
        <div className="flex items-center gap-space-xs">
          {onOpenNotifications && <button className={iconButton} title="Notifications" aria-label="Notifications" onClick={onOpenNotifications} type="button"><Icon name="notifications" className="text-lg" /></button>}
          <button className={iconButton} title={soundEnabled ? 'Mute sound' : 'Unmute sound'} aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'} aria-pressed={soundEnabled} onClick={toggleSound} type="button"><Icon name={soundEnabled ? 'volume_up' : 'volume_off'} className="text-lg" /></button>
          {user?.role === 'ADMIN' && (
            <NavLink
              to={paths.admin}
              title="Admin dashboard"
              aria-label="Admin dashboard"
              className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary font-label-action text-sm font-semibold transition-all active:scale-95 shadow-sm"
            >
              <Icon name="admin_panel_settings" className="text-lg text-primary" />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
          )}
          <NavLink className={iconButton} title="Account settings" aria-label="Account settings" to={paths.account}><Icon name="settings" className="text-lg" /></NavLink>
        </div>
        <div className="flex items-center gap-space-xs">
          <img alt={displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/40" src={avatarUrl}
            onError={event => { event.currentTarget.src = '/stitch-assets/avatar.svg' }} />
          <span className="hidden 2xl:block max-w-36 truncate text-sm font-semibold text-on-surface">{displayName}</span>
          <button className={iconButton} title="Sign out" aria-label="Sign out" type="button" onClick={onLogout} disabled={logoutPending}>
            <Icon name="logout" className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  </header>
}
