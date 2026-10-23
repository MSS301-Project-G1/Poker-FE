import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon } from '@/shared/ui'
import { paths } from '@/shared/config/paths'
import styles from './AdminSidebar.module.css'

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  productCount = 0,
  bundleCount = 0,
}) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <aside className={styles.sidebar}>
      <div>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandBadge}>
            <Icon name="admin_panel_settings" />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>Quản Trị Hệ Thống</span>
            <span className={styles.brandSubtitle}>MSS Poker Gaming Platform</span>
          </div>
        </div>

        {/* Quick Search Box (Image 3 inspired) */}
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

        {/* Section 1: Kho Hàng & Sản Phẩm */}
        <div className={styles.navSection}>
          <span className={styles.sectionLabel}>Kho Hàng & Assets</span>
          <div className={styles.navGroup}>
            <button
              type="button"
              onClick={() => onSelectTab('PRODUCTS')}
              className={`${styles.navItem} ${activeTab === 'PRODUCTS' ? styles.navItemActive : ''}`}
            >
              <div className={styles.navItemLeft}>
                <span className={styles.navIcon}>
                  <Icon name="inventory_2" />
                </span>
                <span className={styles.navLabel}>Quản Lý Kho Hàng</span>
              </div>
              {productCount > 0 && (
                <span className={styles.badge}>{productCount}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('ADD_PRODUCT')}
              className={`${styles.navItem} ${activeTab === 'ADD_PRODUCT' ? styles.navItemActiveGold : ''}`}
            >
              <div className={styles.navItemLeft}>
                <span className={styles.navIcon}>
                  <Icon name="add_circle" />
                </span>
                <span className={styles.navLabel}>Thêm Vật Phẩm & Skin</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 shadow-sm">
                + Thêm
              </span>
            </button>
          </div>
        </div>

        {/* Section 2: Tài Chính & Nạp Tiền */}
        <div className={styles.navSection}>
          <span className={styles.sectionLabel}>Tài Chính & Doanh Thu</span>
          <div className={styles.navGroup}>
            <button
              type="button"
              onClick={() => onSelectTab('BUNDLES')}
              className={`${styles.navItem} ${activeTab === 'BUNDLES' ? styles.navItemActiveGold : ''}`}
            >
              <div className={styles.navItemLeft}>
                <span className={styles.navIcon}>
                  <Icon name="payments" />
                </span>
                <span className={styles.navLabel}>Gói Nạp VIP Coin (PayOS)</span>
              </div>
              {bundleCount > 0 && (
                <span className={`${styles.badge} ${activeTab === 'BUNDLES' ? styles.badgeGold : ''}`}>
                  {bundleCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Section 3: Điều Hành Game */}
        <div className={styles.navSection}>
          <span className={styles.sectionLabel}>Điều Hành Trận Đấu</span>
          <div className={styles.navGroup}>
            <button
              type="button"
              onClick={() => navigate(paths.adminMatchSettings)}
              className={styles.navItem}
            >
              <div className={styles.navItemLeft}>
                <span className={styles.navIcon}>
                  <Icon name="tune" />
                </span>
                <span className={styles.navLabel}>Cấu Hình Bàn Chơi</span>
              </div>
              <Icon name="chevron_right" className="text-white/40 text-base" />
            </button>
          </div>
        </div>
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
      </div>
    </aside>
  )
}
