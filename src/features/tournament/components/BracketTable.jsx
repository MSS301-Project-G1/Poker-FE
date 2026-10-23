import { Button, Icon } from '@/shared/ui'
import { placeLabel, playerName } from '../format'
import styles from './BracketTable.module.css'

const statusText = { PENDING: 'Opening', PLAYING: 'Live', FINISHED: 'Finished' }

// One bracket table: seats in seat order while it plays, by place once finished. Qualifier players who
// were not knocked out move on to the final.
export default function BracketTable({ table, entriesById, profiles, accountId, onOpenTable }) {
  const final = table.round === 'FINAL'
  const mine = table.seats.some(seat => seat.accountId === accountId)
  const seats = [...table.seats].sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity) || a.seatIndex - b.seatIndex)
  const title = final ? 'Final' : `Table ${table.tableIndex}`

  return <article className={`${styles.table} ${final ? styles.final : ''} ${mine ? styles.mine : ''}`} aria-label={title}>
    <header className={styles.header}>
      <h3 className={styles.title}>{final && <Icon name="emoji_events" className={styles.trophy} />}{title}</h3>
      <span className={`${styles.status} ${styles[table.status.toLowerCase()]}`}>{statusText[table.status]}</span>
    </header>
    <ol className={styles.seats}>
      {seats.map(seat => {
        const you = seat.accountId === accountId
        const advances = !final && seat.place != null && entriesById[seat.accountId]?.status !== 'ELIMINATED'
        return <li key={seat.accountId} className={`${styles.seat} ${you ? styles.you : ''}`}>
          <span className={styles.number}>{seat.seatIndex + 1}</span>
          <span className={styles.name}><span className={styles.text}>{playerName(profiles, seat.accountId)}</span>{you && <em className={styles.tag}>You</em>}</span>
          {advances && <em className={`${styles.tag} ${styles.advance}`}>Final</em>}
          {seat.place != null && <span className={`${styles.place} ${final && seat.place === 1 ? styles.winner : ''}`}>{placeLabel(seat.place)}</span>}
        </li>
      })}
    </ol>
    {mine && table.status === 'PLAYING' && table.tableId &&
      <Button variant="primary" className={styles.open} onClick={() => onOpenTable(table.tableId)}>Open table</Button>}
  </article>
}
