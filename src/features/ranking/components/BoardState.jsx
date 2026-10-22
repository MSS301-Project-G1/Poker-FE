import { Button, Icon } from '@/shared/ui'
import Panel from './Panel'
import styles from './BoardState.module.css'

const roles = { loading: 'status', error: 'alert' }

// Loading, error and empty states shared by the season and friends boards.
export default function BoardState({ kind, title, message, actionLabel, onAction }) {
  return <Panel className={styles.state} role={roles[kind]}>
    {kind === 'loading' ? <div className={styles.spinner} /> : <Icon name={kind === 'error' ? 'error' : 'playing_cards'} className={styles.icon} />}
    {title && <h2 className={styles.title}>{title}</h2>}
    {message && <p className={kind === 'error' ? styles.error : styles.muted}>{message}</p>}
    {actionLabel && <Button variant="primary" onClick={onAction}>{actionLabel}</Button>}
  </Panel>
}
