import { NavLink } from 'react-router'
import { paths } from '@/shared/config/paths'

const navItems = [
  { to: paths.lobby, label: 'Lobby' },
  { to: paths.ranked, label: 'Ranked' },
  { to: paths.shop, label: 'Shop' },
  { to: paths.events, label: 'Events' },
  { to: paths.mailbox, label: 'Mailbox' },
]

const navClass = ({ isActive }) => `px-space-md py-space-sm font-label-action transition-all ${isActive
  ? 'bg-primary-container text-on-primary-container rounded-lg'
  : 'text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`

const iconButton = 'w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors'

export default function AppHeader() {
  return <header className="fixed top-0 left-0 right-0 z-header bg-surface-container-lowest/85 backdrop-blur-2xl shadow-header">
    <div className="h-20 w-full px-margin flex items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-lg">
        <div className="flex items-center gap-space-sm">
          <img alt="Poker Rank Logo" className="h-9 w-auto object-contain rounded-md" src="/stitch-assets/logo.svg" />
          <span className="font-headline-sm text-headline-sm uppercase tracking-wider text-primary">POKER RANK</span>
        </div>
        <nav className="hidden lg:flex items-center gap-space-xs">
          {navItems.map(item => <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>)}
        </nav>
      </div>
      <div className="flex items-center gap-space-md">
        <div className="hidden sm:flex items-center bg-surface-container-low px-space-md py-space-xs rounded-full gap-space-xs shadow-inner">
          <span className="material-symbols-outlined text-tertiary text-lg">toll</span>
          <span className="font-label-numeric-md text-label-numeric-md text-tertiary">1,250,000</span>
        </div>
        <div className="flex items-center gap-space-xs">
          <button className={iconButton} title="Audio" type="button"><span className="material-symbols-outlined text-lg">volume_up</span></button>
          <button className={iconButton} title="Settings" type="button"><span className="material-symbols-outlined text-lg">settings</span></button>
        </div>
        <div className="flex items-center gap-space-xs cursor-pointer">
          <img alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/40" src="/stitch-assets/avatar.svg" />
        </div>
      </div>
    </div>
  </header>
}
