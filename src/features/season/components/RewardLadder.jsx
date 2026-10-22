import { TierBadge, tierOrder } from '@/features/ranking'
import { Icon } from '@/shared/ui'
import RewardItems from './RewardItems'
import styles from './RewardLadder.module.css'

/**
 * Tier rewards from lowest to highest. Rewards add up (SPEC §2.3), so every tier up to the player's
 * current tier is marked as reached; the tier when the season closes is what counts.
 */
export default function RewardLadder({ rewards, currentTier }) {
  const reached = currentTier ? tierOrder.indexOf(currentTier) : -1
  const tiers = tierOrder.filter(tier => rewards.some(reward => reward.tier === tier))
  if (tiers.length === 0) return <p className={styles.muted}>This season has no tier rewards yet.</p>

  return <ol className={styles.ladder}>
    {tiers.map(tier => {
      const done = tierOrder.indexOf(tier) <= reached
      return <li key={tier} className={`${styles.step} ${done ? styles.done : ''}`}>
        <TierBadge tier={tier} />
        <div className={styles.rewards}><RewardItems rewards={rewards.filter(reward => reward.tier === tier)} /></div>
        <span className={styles.status}>{done
          ? <><Icon name="check_circle" filled className={styles.statusIcon} />Reached</>
          : <><Icon name="lock" className={styles.statusIcon} />Locked</>}</span>
      </li>
    })}
  </ol>
}
