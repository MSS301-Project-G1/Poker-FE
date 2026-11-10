import { useState, memo } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'
import { getCategoryIcon } from '../utils/shopFormatters'
import styles from './ShopSidebar.module.css'

const ShopSidebar = memo(function ShopSidebar({
  categories = [],
  activeCategory = 'ALL',
  onSelectCategory,
  inventoryCount = 0,
  isLoggedIn = false,
}) {
  const navigate = useNavigate()
  // Fixed expanded by default, user can toggle collapse as an explicit option
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}
      aria-label="Shop categories"
    >
      <div className={styles.navList}>
        {/* Header: Brand and Collapse Toggle */}
        <div className={styles.header}>
          {!isCollapsed && (
            <div className={styles.headerLeft}>
              <span className={styles.brandIcon}>
                <Icon name="storefront" />
              </span>
              <div className={styles.brandText}>
                <span className={styles.brandTitle}>Categories</span>
              </div>
            </div>
          )}

          {/* Manual Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(prev => !prev)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={styles.toggleBtn}
          >
            <Icon name={isCollapsed ? 'chevron_right' : 'chevron_left'} />
          </button>
        </div>

        {/* Category: ALL */}
        <button
          type="button"
          onClick={() => onSelectCategory('ALL')}
          title="All items"
          className={`${styles.navItem} ${isCollapsed ? styles.navItemCollapsed : ''} ${
            activeCategory === 'ALL' ? styles.navItemActive : ''
          }`}
        >
          <span className={styles.navIcon}>
            <Icon name="grid_view" filled={activeCategory === 'ALL'} />
          </span>
          {!isCollapsed && <span className={styles.navLabel}>All items</span>}
        </button>

        {/* Categories from Backend */}
        {categories.map(cat => {
          const isActive = activeCategory === cat.code
          const iconName = getCategoryIcon(cat.code)

          return (
            <button
              key={cat.id || cat.code}
              type="button"
              onClick={() => onSelectCategory(cat.code)}
              title={cat.name}
              className={`${styles.navItem} ${isCollapsed ? styles.navItemCollapsed : ''} ${
                isActive ? styles.navItemActive : ''
              }`}
            >
              <span className={styles.navIcon}>
                <Icon name={iconName} filled={isActive} />
              </span>
              {!isCollapsed && <span className={styles.navLabel}>{cat.name}</span>}
            </button>
          )
        })}

        <div className={styles.divider} />

        {/* My Inventory Tab */}
        <button
          type="button"
          onClick={() => onSelectCategory('MY_INVENTORY')}
          title="My inventory"
          className={`${styles.navItem} ${
            isCollapsed ? styles.navItemCollapsed : ''
          } ${activeCategory === 'MY_INVENTORY' ? styles.navItemInventoryActive : ''}`}
        >
          <span className={styles.navIcon}>
            <Icon name="inventory_2" filled={activeCategory === 'MY_INVENTORY'} />
          </span>
          {!isCollapsed && (
            <>
              <span className={styles.navLabel}>My inventory</span>
              {inventoryCount > 0 && <span className={styles.navBadge}>{inventoryCount}</span>}
            </>
          )}
        </button>

        {/* My Wallet & Transactions Tab */}
        <button
          type="button"
          onClick={() => onSelectCategory('MY_WALLET')}
          title="Wallet & history"
          className={`${styles.navItem} ${
            isCollapsed ? styles.navItemCollapsed : ''
          } ${activeCategory === 'MY_WALLET' ? styles.navItemWalletActive : ''}`}
        >
          <span className={styles.navIcon}>
            <Icon name="account_balance_wallet" filled={activeCategory === 'MY_WALLET'} />
          </span>
          {!isCollapsed && (
            <span className={styles.navLabel}>Wallet & history</span>
          )}
        </button>
      </div>

      {/* Bottom Sidebar Action: Nạp VIP Coin */}
      <div className={styles.bottomArea}>
        <button
          type="button"
          onClick={() => navigate(isLoggedIn ? '/shop/bundles' : paths.auth)}
          title={isLoggedIn ? 'Top up VIP Coin (PayOS)' : 'Sign in to top up VIP Coin'}
          className={`${styles.topupBtn} ${isCollapsed ? styles.topupBtnCollapsed : ''}`}
        >
          <span className={styles.navIcon}>
            <Icon name="paid" />
          </span>
          {!isCollapsed && <span>{isLoggedIn ? 'Top up VIP Coin' : 'Sign in to top up'}</span>}
        </button>
      </div>
    </aside>
  )
})

export default ShopSidebar

