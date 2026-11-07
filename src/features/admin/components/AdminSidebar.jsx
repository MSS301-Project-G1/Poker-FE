import { useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'
import styles from './AdminSidebar.module.css'

const adminNavSections = [
  {
    label: 'Tổng Quan & Điều Hành',
    items: [
      { path: paths.admin, label: 'Trang quản trị', icon: 'dashboard', end: true },
      { path: paths.adminMatchSettings, label: 'Bàn chơi', icon: 'tune' },
    ],
  },
  {
    label: 'Tài Khoản & Người Dùng',
    items: [
      { path: paths.adminUsers, label: 'Người dùng', icon: 'manage_accounts' },
    ],
  },
  {
    label: 'Kinh Tế & Vật Phẩm',
    items: [
      { path: paths.adminShop, label: 'Cửa hàng', icon: 'storefront' },
      { path: paths.adminAvatars, label: 'Avatar', icon: 'account_circle' },
    ],
  },
  {
    label: 'Mùa Giải & Sự Kiện',
    items: [
      { path: paths.adminSeasons, label: 'Mùa giải', icon: 'leaderboard' },
      { path: paths.adminTournaments, label: 'Giải đấu', icon: 'emoji_events' },
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
          <div className={styles.brandBadge}>
            <Icon name="admin_panel_settings" />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>Quản Trị Hệ Thống</span>
            <span className={styles.brandSubtitle}>{user?.email || 'MSS Poker Admin'}</span>
          </div>
        </Link>

        {/* Quick Search Box */}
        <div className={styles.searchBox}>
          <Icon name="search" className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm nhanh mục quản trị..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Navigation Sections */}
        <nav aria-label="Điều hướng quản trị">
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
              Không tìm thấy mục quản trị phù hợp
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
          <Icon name="storefront" className="text-amber-400 text-lg" />
          <span>Xem Giao Diện Cửa Hàng</span>
        </button>
        <button
          type="button"
          onClick={() => navigate(paths.lobby)}
          className={styles.externalLink}
        >
          <Icon name="sports_esports" className="text-primary text-lg" />
          <span>Quay Về Sảnh Game</span>
        </button>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            disabled={signOutPending}
            className={`${styles.externalLink} text-red-400 hover:text-red-300 hover:bg-red-500/10`}
          >
            <Icon name="logout" className="text-red-400 text-lg" />
            <span>{signOutPending ? 'Đang đăng xuất…' : 'Đăng xuất'}</span>
          </button>
        )}
      </div>
    </aside>
  )
}

