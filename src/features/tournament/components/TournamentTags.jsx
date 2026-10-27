import { Icon } from '@/shared/ui'
import { statusLabels, typeLabels } from '../format'
import styles from './TournamentTags.module.css'

const live = new Set(['QUALIFYING', 'FINAL'])

// Type chip (Elite gold, Open violet) and status chip; live rounds pulse.
export default function TournamentTags({ type, status }) {
  const tone = live.has(status) ? styles.live : status === 'CANCELLED' ? styles.cancelled : ''
  return <div className={styles.tags}>
    <span className={`${styles.tag} ${type === 'ELITE' ? styles.elite : styles.open}`}>
      <Icon name={type === 'ELITE' ? 'workspace_premium' : 'groups'} className={styles.icon} />{typeLabels[type]}
    </span>
    <span className={`${styles.tag} ${tone}`}>{live.has(status) && <span className={styles.dot} />}{statusLabels[status]}</span>
  </div>
}
