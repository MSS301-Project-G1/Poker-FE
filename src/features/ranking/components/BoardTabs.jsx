import { Icon } from '@/shared/ui'
import styles from './BoardTabs.module.css'

const boardViews = [
  { id: 'season', label: 'Season', icon: 'public' },
  { id: 'friends', label: 'Friends', icon: 'group' },
]

// Tab list for the leaderboard views; the panel below carries id `board-panel`.
export default function BoardTabs({ view, onChange }) {
  return <div className={styles.tabs} role="tablist" aria-label="Leaderboard view">
    {boardViews.map(tab => <button key={tab.id} id={`board-tab-${tab.id}`} type="button" role="tab"
      aria-selected={view === tab.id} aria-controls="board-panel"
      className={`${styles.tab} ${view === tab.id ? styles.active : ''}`} onClick={() => onChange(tab.id)}>
      <Icon name={tab.icon} className={styles.icon} />{tab.label}
    </button>)}
  </div>
}
