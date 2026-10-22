import { tiers } from '@/features/ranking'
import { Icon } from '@/shared/ui'
import { formatCoins } from '../format'
import styles from './RewardItems.module.css'

// Coins and skins of one tier or one claim. Skin names come from the shop once it exposes them.
export default function RewardItems({ rewards }) {
  return <ul className={styles.items}>
    {rewards.map(reward => <li key={`${reward.tier}:${reward.rewardType}:${reward.productId || reward.amount}`}
      title={`${tiers[reward.tier]?.label || reward.tier} reward`}
      className={`${styles.item} ${reward.rewardType === 'COIN' ? styles.coin : styles.skin}`}>
      <Icon name={reward.rewardType === 'COIN' ? 'toll' : 'palette'} className={styles.icon} />
      {reward.rewardType === 'COIN' ? formatCoins(reward.amount) : 'Exclusive skin'}
    </li>)}
  </ul>
}
