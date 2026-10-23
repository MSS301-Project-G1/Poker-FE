import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon, Button } from '@/shared/ui'
import { useWalletTransactions } from '../hooks/useWalletTransactions'
import styles from './WalletOverviewTab.module.css'

function formatCurrencyNumber(val) {
  if (val === null || val === undefined) return '0'
  return Number(val).toLocaleString('vi-VN')
}

function formatDate(isoString) {
  if (!isoString) return '--'
  try {
    const d = new Date(isoString)
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

function formatAuditRef(idempotencyKey, txId) {
  if (!idempotencyKey) return txId ? `#${txId.slice(0, 8)}` : '--'
  if (idempotencyKey.startsWith('PURCHASE:')) {
    return `MUA #${idempotencyKey.slice(9, 17)}`
  }
  if (idempotencyKey.startsWith('ORDER:')) {
    return `NẠP #${idempotencyKey.slice(6, 14)}`
  }
  if (idempotencyKey.startsWith('checkin:')) {
    return 'CHECK-IN'
  }
  return `#${idempotencyKey.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`
}

function getReasonInfo(reason, amount) {
  switch (reason) {
    case 'SHOP_BUY_ITEM':
    case 'SHOP_PURCHASE':
      return {
        title: 'Mua Vật Phẩm Cửa Hàng',
        desc: 'Trừ VIP Coin sở hữu trang trí',
        icon: 'shopping_bag',
        bg: 'rgba(244, 63, 94, 0.15)',
        color: '#f43f5e',
      }
    case 'TOPUP_BUNDLE_PAYOS':
    case 'DEPOSIT':
    case 'PAYMENT_PAYOS':
    case 'BUNDLE_TOPUP':
      return {
        title: 'Nạp VIP Coin (PayOS)',
        desc: 'Cộng VIP Coin từ đơn thanh toán PayOS',
        icon: 'add_card',
        bg: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
      }

    case 'DAILY_CHECKIN':
    case 'DAILY_REWARD':
      return {
        title: 'Thưởng Điểm Danh Hàng Ngày',
        desc: 'Phần thưởng đăng nhập mỗi ngày',
        icon: 'event_available',
        bg: 'rgba(56, 189, 248, 0.15)',
        color: '#38bdf8',
      }
    case 'GAME_WIN':
      return {
        title: 'Thắng cược ván bài',
        desc: 'Cộng tiền thắng pot',
        icon: 'emoji_events',
        bg: 'rgba(234, 179, 8, 0.15)',
        color: '#eab308',
      }
    case 'GAME_BET':
      return {
        title: 'Đặt cược bàn chơi',
        desc: 'Trừ tiền vào pot bàn chơi',
        icon: 'casino',
        bg: 'rgba(168, 85, 247, 0.15)',
        color: '#a855f7',
      }
    case 'ADMIN_ADJUST':
      return {
        title: 'Điều chỉnh bởi Admin',
        desc: 'Biến động số dư từ quản trị viên',
        icon: 'admin_panel_settings',
        bg: 'rgba(245, 158, 11, 0.15)',
        color: '#f59e0b',
      }
    default:
      return {
        title: reason || (amount >= 0 ? 'Cộng tiền vào ví' : 'Trừ tiền khỏi ví'),
        desc: 'Giao dịch hệ thống Poker',
        icon: amount >= 0 ? 'arrow_downward' : 'arrow_upward',
        bg: amount >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
        color: amount >= 0 ? '#10b981' : '#f43f5e',
      }
  }
}

export default function WalletOverviewTab({
  wallet,
  isLoggedIn = false,
  onRefreshWallet,
}) {
  const navigate = useNavigate()
  const {
    transactions,
    page,
    setPage,
    totalPages,
    totalElements,
    loading: txLoading,
    currencyFilter,
    setCurrencyFilter,
    refresh: refreshTx,
  } = useWalletTransactions()

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl my-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-400/10">
          <Icon name="account_balance_wallet" className="text-3xl" />
        </div>
        <h3 className="font-headline font-bold text-2xl text-white mb-2">
          Ví Cá Nhân & Lịch Sử Giao Dịch
        </h3>
        <p className="text-sm text-white/60 max-w-md mb-6 leading-relaxed">
          Bạn đang ở chế độ xem khách. Vui lòng đăng nhập tài khoản để kiểm tra số dư VIP Coin, Poker Chips và toàn bộ lịch sử biến động số dư.
        </p>
        <Button
          variant="gold"
          size="md"
          icon="login"
          onClick={() => navigate(paths.auth)}
        >
          Đăng Nhập Ngay
        </Button>
      </div>
    )
  }

  const handleRefreshAll = () => {
    if (onRefreshWallet) onRefreshWallet()
    refreshTx()
  }

  return (
    <div className={styles.wrapper}>
      {/* Top Banner Overview */}
      <div className={styles.headerCard}>
        <div className={styles.headerTitleCol}>
          <h2 className={styles.headerTitle}>
            <Icon name="account_balance_wallet" className={styles.headerIcon} />
            <span>Trung Tâm Ví & Tài Sản</span>
          </h2>
          <p className={styles.headerSubtitle}>
            Theo dõi chi tiết số dư VIP Coin, Poker Chips và mọi biến động giao dịch minh bạch theo thời gian thực.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={handleRefreshAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 border border-white/10 transition-colors"
            title="Làm mới số dư ví và lịch sử"
          >
            <Icon name="refresh" className={txLoading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <Button
            variant="gold"
            size="sm"
            icon="add_circle"
            onClick={() => navigate('/shop/bundles')}
          >
            Nạp VIP Coin (PayOS)
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        {/* VIP Coin Card */}
        <div className={`${styles.kpiCard} ${styles.kpiCardGold}`}>
          <div>
            <div className={styles.kpiHeader}>
              <span className={`${styles.kpiBadge} ${styles.kpiBadgeGold}`}>
                <Icon name="paid" /> Tiền Tệ VIP
              </span>
              <div className={`${styles.kpiIconWrapper} ${styles.iconGold}`}>
                <Icon name="diamond" />
              </div>
            </div>
            <div className={styles.kpiValue}>
              {formatCurrencyNumber(wallet?.vipCoinBalance ?? wallet?.vipCoin ?? 0)}
              <span className="text-sm font-semibold text-amber-400/90 ml-1.5">VIP Coin</span>
            </div>
            <p className={styles.kpiDesc}>
              Dùng để sở hữu các bộ lá bài Tây 3D nghệ thuật, hiệu ứng All-In và vật phẩm danh giá trong Cửa Hàng.
            </p>
          </div>
          <div className={styles.kpiFooter}>
            <span className="text-xs text-white/50">Cổng thanh toán PayOS</span>
            <button
              type="button"
              onClick={() => navigate('/shop/bundles')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              Nạp ngay <Icon name="arrow_forward" className="text-xs" />
            </button>
          </div>
        </div>

        {/* Poker Chips Card */}
        <div className={`${styles.kpiCard} ${styles.kpiCardChips}`}>
          <div>
            <div className={styles.kpiHeader}>
              <span className={`${styles.kpiBadge} ${styles.kpiBadgeChips}`}>
                <Icon name="casino" /> Chips Bàn Chơi
              </span>
              <div className={`${styles.kpiIconWrapper} ${styles.iconChips}`}>
                <Icon name="token" />
              </div>
            </div>
            <div className={styles.kpiValue}>
              {formatCurrencyNumber(wallet?.balance ?? wallet?.coin ?? 0)}
              <span className="text-sm font-semibold text-purple-400/90 ml-1.5">Chips</span>
            </div>
            <p className={styles.kpiDesc}>
              Số dư chips đặt cược trên các bàn thi đấu Poker Ranked và Casual Tables với người chơi khác.
            </p>
          </div>
          <div className={styles.kpiFooter}>
            <span className="text-xs text-white/50">Sẵn sàng thi đấu</span>
            <button
              type="button"
              onClick={() => navigate(paths.lobby)}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              Vào sảnh chơi <Icon name="arrow_forward" className="text-xs" />
            </button>
          </div>
        </div>

        {/* Account Activity / Stats Card */}
        <div className={`${styles.kpiCard} ${styles.kpiCardStats}`}>
          <div>
            <div className={styles.kpiHeader}>
              <span className={`${styles.kpiBadge} ${styles.kpiBadgeStats}`}>
                <Icon name="verified_user" /> Trạng Thái Ví
              </span>
              <div className={`${styles.kpiIconWrapper} ${styles.iconStats}`}>
                <Icon name="shield" />
              </div>
            </div>
            <div className={styles.kpiValue}>
              {totalElements}
              <span className="text-sm font-semibold text-sky-400/90 ml-1.5">Giao dịch</span>
            </div>
            <p className={styles.kpiDesc}>
              {wallet?.updatedAt
                ? `Cập nhật số dư gần nhất lúc: ${formatDate(wallet.updatedAt)}`
                : 'Tài khoản ví hoạt động bình thường, bảo mật bởi API Gateway.'}
            </p>
          </div>
          <div className={styles.kpiFooter}>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Đã kết nối ví
            </span>
            <span className="text-xs text-white/50 font-medium">
              Bảo mật SSL 256-bit
            </span>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className={styles.historySection}>
        <div className={styles.historyTopRow}>
          <h3 className={styles.historyTitle}>
            <Icon name="history" className="text-amber-400" />
            <span>Lịch Sử Biến Động Số Dư</span>
          </h3>

          <div className={styles.filterTabs}>
            <button
              type="button"
              onClick={() => setCurrencyFilter('ALL')}
              className={`${styles.filterBtn} ${currencyFilter === 'ALL' ? styles.filterBtnActive : ''}`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setCurrencyFilter('VIP_COIN')}
              className={`${styles.filterBtn} ${currencyFilter === 'VIP_COIN' ? styles.filterBtnActive : ''}`}
            >
              VIP Coin
            </button>
            <button
              type="button"
              onClick={() => setCurrencyFilter('COIN')}
              className={`${styles.filterBtn} ${currencyFilter === 'COIN' ? styles.filterBtnActive : ''}`}
            >
              Coin
            </button>
            <button
              type="button"
              onClick={() => setCurrencyFilter('CHIP')}
              className={`${styles.filterBtn} ${currencyFilter === 'CHIP' ? styles.filterBtnActive : ''}`}
            >
              Chips
            </button>
          </div>
        </div>

        {/* Table or Empty State */}
        {txLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-white/60">Đang tải lịch sử giao dịch ví...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className={styles.emptyState}>
            <Icon name="receipt_long" className={styles.emptyIcon} />
            <h4 className={styles.emptyTitle}>Chưa có giao dịch nào</h4>
            <p className={styles.emptyDesc}>
              {currencyFilter === 'ALL'
                ? 'Ví của bạn chưa ghi nhận biến động số dư nào. Khi bạn nạp coin hoặc mua vật phẩm, lịch sử sẽ hiển thị tại đây.'
                : `Không có giao dịch nào thuộc bộ lọc "${currencyFilter}".`}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Giao dịch & Lý do</th>
                    <th>Thời gian</th>
                    <th>Loại ví</th>
                    <th>Biến động</th>
                    <th>Số dư sau GD</th>
                    <th>Mã đối soát</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => {
                    const info = getReasonInfo(tx.reason, tx.amount)
                    const isPositive = Number(tx.amount) >= 0

                    return (
                      <tr key={tx.id}>
                        <td>
                          <div className={styles.reasonCell}>
                            <div
                              className={styles.reasonIcon}
                              style={{ backgroundColor: info.bg, color: info.color }}
                            >
                              <Icon name={info.icon} />
                            </div>
                            <div>
                              <span className={styles.reasonTitle}>{info.title}</span>
                              <span className={styles.reasonSub}>{info.desc}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-xs text-white/70">{formatDate(tx.createdAt)}</span>
                        </td>
                        <td>
                          <span
                            className={`${styles.currencyBadge} ${
                              tx.currencyType === 'VIP_COIN'
                                ? styles.badgeVip
                                : tx.currencyType === 'CHIP'
                                ? styles.badgeChip
                                : styles.badgeCoin
                            }`}
                          >
                            {tx.currencyType || 'VIP'}
                          </span>
                        </td>
                        <td>
                          <span className={isPositive ? styles.amountPlus : styles.amountMinus}>
                            {isPositive ? `+${formatCurrencyNumber(tx.amount)}` : formatCurrencyNumber(tx.amount)}
                          </span>
                        </td>
                        <td>
                          <span className={styles.balanceAfter}>
                            {formatCurrencyNumber(tx.balanceAfter)}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-[11px] text-white/60 tracking-wider">
                            {formatAuditRef(tx.idempotencyKey, tx.id)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className={styles.paginationRow}>
                <span className={styles.pageInfo}>
                  Trang {page + 1} / {totalPages} (Tổng {totalElements} giao dịch)
                </span>
                <div className={styles.pageControls}>
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className={styles.pageBtn}
                    title="Trang trước"
                  >
                    <Icon name="chevron_left" />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className={styles.pageBtn}
                    title="Trang sau"
                  >
                    <Icon name="chevron_right" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
