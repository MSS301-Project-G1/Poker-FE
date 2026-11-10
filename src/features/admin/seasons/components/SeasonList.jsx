import { Button } from '@/shared/ui'
import { formatDate, statusLabels, summarize } from '../format'
import styles from './SeasonList.module.css'

// Seasons newest first; selecting one opens its rewards. The active season closes into the next UPCOMING one.
export default function SeasonList({ seasons, selectedId, next, closing, onSelect, onClose }) {
  return <ul className={styles.list}>
    {seasons.map(season => {
      const { coins, items } = summarize(season.rewards)
      const selected = season.id === selectedId
      return <li key={season.id} className={`${styles.item} ${selected ? styles.selected : ''}`}>
        <button type="button" className={styles.select} aria-pressed={selected} onClick={() => onSelect(season.id)}>
          <span className={styles.top}>
            <strong className={styles.name}>{season.name}</strong>
            <span className={`${styles.status} ${styles[season.status.toLowerCase()]}`}>{statusLabels[season.status]}</span>
          </span>
          <span className={styles.meta}>{formatDate(season.startAt)} – {formatDate(season.endAt)}</span>
          <span className={styles.meta}>Keeps {season.resetPercent}% of Elo · {coins.toLocaleString()} coins{items ? ` · ${items} skins` : ''}</span>
        </button>
        {season.status === 'ACTIVE' && <div className={styles.close}>
          <Button variant="danger" disabled={!next || closing} onClick={() => onClose(season)}>{closing ? 'Closing…' : 'Close season now'}</Button>
          <p className={styles.hint}>{next ? `${next.name} starts right after.`
            : 'Create the next season first. Until then this season keeps running past its end date.'}</p>
        </div>}
      </li>
    })}
  </ul>
}
