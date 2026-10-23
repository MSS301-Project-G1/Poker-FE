import { Button, Icon } from '@/shared/ui'
import styles from './SectionState.module.css'

const roles = { loading: 'status', error: 'alert' }

// Loading, error and empty message inside a season section.
export default function SectionState({ kind, title, message, actionLabel, onAction }) {
  return <div className={styles.state} role={roles[kind]}>
    {kind === 'loading' ? <div className={styles.spinner} /> : <Icon name={kind === 'error' ? 'error' : 'card_giftcard'} className={styles.icon} />}
    {title && <h3 className={styles.title}>{title}</h3>}
    {message && <p className={kind === 'error' ? styles.error : styles.muted}>{message}</p>}
    {actionLabel && <Button variant="primary" onClick={onAction}>{actionLabel}</Button>}
  </div>
}
