import { useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'
import styles from './AdminSidebar.module.css'

const adminNavSections = [
  {
    label: 'Overview',
    items: [
      { path: paths.admin, label: 'Admin home', icon: 'dashboard', end: true },
      { path: paths.adminMatchSettings, label: 'Match settings', icon: 'tune' },
    ],
  },
  {
    label: 'Accounts',
    items: [
      { path: paths.adminUsers, label: 'Users', icon: 'manage_accounts' },
    ],
  },
  {
    label: 'Economy',
    items: [
      { path: paths.adminShop, label: 'Shop', icon: 'storefront' },
      { path: paths.adminAvatars, label: 'Avatars', icon: 'account_circle' },
    ],
  },
  {
    label: 'Seasons & events',
    items: [
      { path: paths.adminSeasons, label: 'Seasons', icon: 'leaderboard' },
      { path: paths.adminTournaments, label: 'Tournaments', icon: 'emoji_events' },
    ],
  },
]

export default function AdminSidebar({ user, onSignOut, signOutPending }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const query = searchQuery.trim().toLowerCase()

  const filteredSections = useMemo(() => {
    if (!query) return adminNavSections
    return adminNavSections
      .map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.label.toLowerCase().includes(query) ||
          item.path.toLowerCase().includes(query)
        ),
      }))
      .filter(section => section.items.length > 0)
  }, [query])

  return (
    <aside className={styles.sidebar}>
      <div>
        {/* Brand Header */}
        <Link to={paths.admin} className={styles.brandHeader}>
          <img src="/stitch-assets/logo.svg" alt="" className={styles.brandBadge} />
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>Admin</span>
            <span className={styles.brandSubtitle}>{user?.email || 'MSS Poker Admin'}</span>
          </div>
        </Link>

        {/* Quick Search Box */}
        <div className={styles.searchBox}>
          <Icon name="search" className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search admin…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Navigation Sections */}
        <nav aria-label="Admin navigation">
          {filteredSections.map(section => (
            <div key={section.label} className={styles.navSection}>
              <span className={styles.sectionLabel}>{section.label}</span>
              <div className={styles.navGroup}>
                {section.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                    }
                  >
                    <div className={styles.navItemLeft}>
                      <span className={styles.navIcon}>
                        <Icon name={item.icon} />
                      </span>
                      <span className={styles.navLabel}>{item.label}</span>
                    </div>
                    <Icon name="chevron_right" className="text-white/40 text-base" />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
          {filteredSections.length === 0 && (
            <p className="px-3 py-4 text-xs text-white/40 text-center">
              No matching admin pages
            </p>
          )}
        </nav>
      </div>

      {/* Bottom Area: External Navigation Links */}
      <div className={styles.bottomNav}>
        <button
          type="button"
          onClick={() => navigate(paths.shop)}
          className={styles.externalLink}
        >
          <Icon name="storefront" className="text-tertiary text-lg" />
          <span>View shop</span>
        </button>
        <button
          type="button"
          onClick={() => navigate(paths.lobby)}
          className={styles.externalLink}
        >
          <Icon name="sports_esports" className="text-primary text-lg" />
          <span>Back to lobby</span>
        </button>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            disabled={signOutPending}
            className={`${styles.externalLink} text-error hover:text-error hover:bg-error/10`}
          >
            <Icon name="logout" className="text-error text-lg" />
            <span>{signOutPending ? 'Signing out…' : 'Sign out'}</span>
          </button>
        )}
      </div>
    </aside>
  )
}

