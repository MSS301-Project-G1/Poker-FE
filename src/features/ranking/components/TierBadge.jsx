import { Icon } from '@/shared/ui'
import { tiers } from '../tiers'
import styles from './TierBadge.module.css'

export default function TierBadge({ tier }) {
  const info = tiers[tier]
  return <span className={`${styles.badge} ${info ? styles[info.tone] : ''}`}>
    <Icon name={tier === 'CARD_GOD' ? 'workspace_premium' : 'military_tech'} className={styles.icon} />
    {info?.label || tier || 'Unranked'}
  </span>
}
