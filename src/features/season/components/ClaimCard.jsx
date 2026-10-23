import { useState } from 'react'
import { TierBadge } from '@/features/ranking'
import { Button, Eyebrow } from '@/shared/ui'
import { formatCoins, formatDate, summarize } from '../format'
import RewardItems from './RewardItems'
import styles from './ClaimCard.module.css'

// One ended season: final tier, every reward earned up to it, and the claim button.
export default function ClaimCard({ item, onClaim }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { coins, items } = summarize(item.rewards)
  const total = [coins > 0 && formatCoins(coins), items > 0 && `${items} skin${items > 1 ? 's' : ''}`].filter(Boolean).join(' + ')

  const claim = async () => {
    setBusy(true)
    setError('')
    try { await onClaim(item.seasonId) }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <article className={`${styles.card} ${item.claimed ? styles.claimed : ''}`} aria-label={`${item.seasonName} rewards`}>
    <header className={styles.header}>
      <div>
        <Eyebrow>ENDED {formatDate(item.endAt).toUpperCase()}</Eyebrow>
        <h3 className={styles.title}>{item.seasonName}</h3>
      </div>
      <div className={styles.final}><span className={styles.label}>Final tier</span><TierBadge tier={item.finalTier} /></div>
    </header>
    <RewardItems rewards={item.rewards} />
    <footer className={styles.footer}>
      <span className={styles.total}>{total}</span>
      {item.claimed
        ? <span className={styles.done}>Claimed {item.claimedAt ? formatDate(item.claimedAt) : ''}</span>
        : <Button variant="primary" disabled={busy} onClick={claim}>{busy ? 'Claiming…' : 'Claim rewards'}</Button>}
    </footer>
    {error && <p className={styles.error} role="alert">{error}</p>}
  </article>
}
