import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon, Button } from '@/shared/ui'
import { useWalletTransactions } from '../hooks/useWalletTransactions'
import styles from './WalletOverviewTab.module.css'

function formatCurrencyNumber(val) {
  if (val === null || val === undefined) return '0'
  return Number(val).toLocaleString('en-US')
}

function formatDate(isoString) {
  if (!isoString) return '--'
  try {
    const d = new Date(isoString)
    return d.toLocaleString('en-US', {
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
    return `TOP-UP #${idempotencyKey.slice(6, 14)}`
  }
  if (idempotencyKey.startsWith('AUTO_REFUND_') || idempotencyKey.startsWith('AUTO_REFUND:')) {
    return `REFUND #${idempotencyKey.slice(-8).toUpperCase()}`
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
        title: 'Item purchase',
        desc: 'VIP Coin spent on a cosmetic',
        icon: 'shopping_bag',
        bg: 'rgb(var(--color-error) / 0.15)',
        color: 'rgb(var(--color-error))',
      }
    case 'REFUND_COIN':
      return {
        title: 'Item refund',
        desc: '100% VIP Coin refunded automatically when an item is removed',
        icon: 'currency_exchange',
        bg: 'rgb(var(--color-success) / 0.15)',
        color: 'rgb(var(--color-success))',
      }
    case 'TOPUP_BUNDLE_PAYOS':
    case 'DEPOSIT':
    case 'PAYMENT_PAYOS':
    case 'BUNDLE_TOPUP':
      return {
        title: 'VIP Coin top-up (PayOS)',
        desc: 'VIP Coin credited from a PayOS order',
        icon: 'add_card',
        bg: 'rgb(var(--color-success) / 0.15)',
        color: 'rgb(var(--color-success))',
      }

    case 'DAILY_CHECKIN':
    case 'DAILY_REWARD':
      return {
        title: 'Daily check-in reward',
        desc: 'Reward for signing in each day',
        icon: 'event_available',
        bg: 'rgb(var(--color-primary) / 0.15)',
        color: 'rgb(var(--color-primary))',
      }
    case 'GAME_WIN':
      return {
        title: 'Hand won',
        desc: 'Pot winnings credited',
        icon: 'emoji_events',
        bg: 'rgb(var(--color-tertiary) / 0.15)',
        color: 'rgb(var(--color-tertiary))',
      }
    case 'GAME_BET':
      return {
        title: 'Table bet',
        desc: 'Chips put into the pot',
        icon: 'casino',
        bg: 'rgb(var(--color-secondary) / 0.15)',
        color: 'rgb(var(--color-secondary))',
      }
    case 'ADMIN_ADJUST':
      return {
        title: 'Admin adjustment',
        desc: 'Balance change by an admin',
        icon: 'admin_panel_settings',
        bg: 'rgb(var(--color-tertiary-container) / 0.15)',
        color: 'rgb(var(--color-tertiary-container))',
      }
    default:
      return {
        title: reason || (amount >= 0 ? 'Credit' : 'Debit'),
        desc: 'Poker system transaction',
        icon: amount >= 0 ? 'arrow_downward' : 'arrow_upward',
        bg: amount >= 0 ? 'rgb(var(--color-success) / 0.15)' : 'rgb(var(--color-error) / 0.15)',
        color: amount >= 0 ? 'rgb(var(--color-success))' : 'rgb(var(--color-error))',
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
    pageSize,
    setPageSize,
    totalPages,
    totalElements,
    totalWalletCount,
    loading: txLoading,
    currencyFilter,
    setCurrencyFilter,
    refresh: refreshTx,
  } = useWalletTransactions()

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl my-4">
        <div className="w-16 h-16 rounded-2xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary mb-4 shadow-lg shadow-tertiary/10">
          <Icon name="account_balance_wallet" className="text-3xl" />
        </div>
        <h3 className="font-headline font-bold text-2xl text-white mb-2">
          Wallet & history
        </h3>
        <p className="text-sm text-white/60 max-w-md mb-6 leading-relaxed">
          You’re browsing as a guest. Sign in to see your VIP Coin and chip balances and full history.
        </p>
        <Button
          variant="gold"
          size="md"
          icon="login"
          onClick={() => navigate(paths.auth)}
        >
          Sign in
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
            <span>Wallet</span>
          </h2>
          <p className={styles.headerSubtitle}>
            Your VIP Coin and chip balances, with every transaction in real time.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={handleRefreshAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 border border-white/10 transition-colors"
            title="Refresh balance and history"
          >
            <Icon name="refresh" className={txLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <Button
            variant="gold"
            size="sm"
            icon="add_circle"
            onClick={() => navigate('/shop/bundles')}
          >
            VIP Coin top-up (PayOS)
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
                <Icon name="paid" /> VIP currency
              </span>
              <div className={`${styles.kpiIconWrapper} ${styles.iconGold}`}>
                <Icon name="diamond" />
              </div>
            </div>
            <div className={styles.kpiValue}>
              {formatCurrencyNumber(wallet?.vipCoinBalance ?? wallet?.vipCoin ?? 0)}
              <span className="text-sm font-semibold text-tertiary/90 ml-1.5">VIP Coin</span>
            </div>
            <p className={styles.kpiDesc}>
              Used for 3D card decks, all-in effects and other items in the shop.
            </p>
          </div>
          <div className={styles.kpiFooter}>
            <span className="text-xs text-white/50">PayOS checkout</span>
            <button
              type="button"
              onClick={() => navigate('/shop/bundles')}
              className="text-xs font-bold text-tertiary hover:text-tertiary-fixed flex items-center gap-1 transition-colors"
            >
              Top up <Icon name="arrow_forward" className="text-xs" />
            </button>
          </div>
        </div>

        {/* Poker Chips Card */}
        <div className={`${styles.kpiCard} ${styles.kpiCardChips}`}>
          <div>
            <div className={styles.kpiHeader}>
              <span className={`${styles.kpiBadge} ${styles.kpiBadgeChips}`}>
                <Icon name="casino" /> Table chips
              </span>
              <div className={`${styles.kpiIconWrapper} ${styles.iconChips}`}>
                <Icon name="token" />
              </div>
            </div>
            <div className={styles.kpiValue}>
              {formatCurrencyNumber(wallet?.balance ?? wallet?.coin ?? 0)}
              <span className="text-sm font-semibold text-secondary/90 ml-1.5">Chips</span>
            </div>
            <p className={styles.kpiDesc}>
              Chips you bet at Ranked and Casual tables against other players.
            </p>
          </div>
          <div className={styles.kpiFooter}>
            <span className="text-xs text-white/50">Ready to play</span>
            <button
              type="button"
              onClick={() => navigate(paths.lobby)}
              className="text-xs font-bold text-secondary hover:text-secondary flex items-center gap-1 transition-colors"
            >
              Go to lobby <Icon name="arrow_forward" className="text-xs" />
            </button>
          </div>
        </div>

        {/* Account Activity / Stats Card */}
        <div className={`${styles.kpiCard} ${styles.kpiCardStats}`}>
          <div>
            <div className={styles.kpiHeader}>
              <span className={`${styles.kpiBadge} ${styles.kpiBadgeStats}`}>
                <Icon name="verified_user" /> Wallet status
              </span>
              <div className={`${styles.kpiIconWrapper} ${styles.iconStats}`}>
                <Icon name="shield" />
              </div>
            </div>
            <div className={styles.kpiValue}>
              {totalWalletCount}
              <span className="text-sm font-semibold text-primary/90 ml-1.5">Transactions</span>
            </div>
            <p className={styles.kpiDesc}>
              {wallet?.updatedAt
                ? `Balance last updated ${formatDate(wallet.updatedAt)}`
                : 'Wallet is active and secured by the API gateway.'}
            </p>
          </div>
          <div className={styles.kpiFooter}>
            <span className="text-xs text-success font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Wallet connected
            </span>
            <span className="text-xs text-white/50 font-medium">
              256-bit SSL
            </span>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className={styles.historySection}>
        <div className={styles.historyTopRow}>
          <h3 className={styles.historyTitle}>
            <Icon name="history" className="text-tertiary" />
            <span>Balance history</span>
          </h3>

          <div className={styles.filterTabs}>
            <button
              type="button"
              onClick={() => setCurrencyFilter('ALL')}
              className={`${styles.filterBtn} ${currencyFilter === 'ALL' ? styles.filterBtnActive : ''}`}
            >
              All
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
            <span className="w-8 h-8 border-3 border-tertiary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-white/60">Loading wallet history…</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className={styles.emptyState}>
            <Icon name="receipt_long" className={styles.emptyIcon} />
            <h4 className={styles.emptyTitle}>No transactions yet</h4>
            <p className={styles.emptyDesc}>
              {currencyFilter === 'ALL'
                ? 'No balance changes yet. Top-ups and purchases will show up here.'
                : `No transactions match “${currencyFilter}”.`}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Time</th>
                    <th>Wallet</th>
                    <th>Change</th>
                    <th>Balance after</th>
                    <th>Reference</th>
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
            {totalElements > 0 && (
              <div className={styles.paginationRow}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={styles.pageInfo}>
                    Showing <strong className="text-white/90">{Math.min(page * pageSize + 1, totalElements)}</strong> - <strong className="text-white/90">{Math.min((page + 1) * pageSize, totalElements)}</strong> trong <strong className="text-tertiary">{totalElements}</strong> transactions
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <span>Rows:</span>
                    <select
                      value={pageSize}
                      onChange={e => setPageSize(Number(e.target.value))}
                      className={styles.pageSizeSelect}
                      aria-label="Transactions per page"
                    >
                      <option value={5}>5 / trang</option>
                      <option value={10}>10 / trang</option>
                      <option value={20}>20 / trang</option>
                    </select>
                  </div>
                </div>

                <div className={styles.pageControls}>
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className={styles.pageBtn}
                    title="Previous page"
                    aria-label="Previous page"
                  >
                    <Icon name="chevron_left" />
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPage(idx)}
                      className={`${styles.pageBtn} ${page === idx ? styles.pageBtnActive : ''}`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    className={styles.pageBtn}
                    title="Next page"
                    aria-label="Next page"
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
