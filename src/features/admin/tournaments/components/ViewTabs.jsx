import { Icon } from '@/shared/ui'
import styles from './ViewTabs.module.css'

const views = [
  { id: 'upcoming', label: 'Upcoming', icon: 'event_upcoming' },
  { id: 'past', label: 'Past', icon: 'history' },
]

// Tab list for the tournament views; the panel below carries id `admin-tournament-panel`.
export default function ViewTabs({ view, onChange }) {
  return <div className={styles.tabs} role="tablist" aria-label="Tournament view">
    {views.map(tab => <button key={tab.id} id={`admin-tournament-tab-${tab.id}`} type="button" role="tab"
      aria-selected={view === tab.id} aria-controls="admin-tournament-panel"
      className={`${styles.tab} ${view === tab.id ? styles.active : ''}`} onClick={() => onChange(tab.id)}>
      <Icon name={tab.icon} className={styles.icon} />{tab.label}
    </button>)}
  </div>
}
