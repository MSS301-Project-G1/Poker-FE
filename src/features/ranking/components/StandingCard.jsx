import { Eyebrow } from '@/shared/ui'
import Panel from './Panel'
import TierBadge from './TierBadge'
import styles from './StandingCard.module.css'

export default function StandingCard({ standing, signedIn, loading }) {
  if (!standing) return <Panel className={styles.standing} aria-label="Your standing">
    <Eyebrow>YOUR STANDING</Eyebrow>
    <p className={styles.muted}>{loading || signedIn ? 'Loading your standing…' : 'Sign in to see your position this season.'}</p>
  </Panel>

  const stats = [['Elo', standing.elo], ['Peak', standing.peakElo], ['Win streak', standing.winStreak], ['Matches', standing.matchesPlayed]]
  return <Panel className={styles.standing} aria-label="Your standing">
    <Eyebrow>YOUR STANDING</Eyebrow>
    <div className={styles.main}>
      <strong className={styles.position}>{standing.position ? `#${standing.position.toLocaleString()}` : 'Unranked'}</strong>
      <TierBadge tier={standing.tier} />
    </div>
    {!standing.position && <p className={styles.muted}>Play a ranked match to join the leaderboard.</p>}
    <dl className={styles.stats}>{stats.map(([label, value]) => <div key={label} className={styles.stat}>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={styles.statValue}>{value.toLocaleString()}</dd>
    </div>)}</dl>
  </Panel>
}
