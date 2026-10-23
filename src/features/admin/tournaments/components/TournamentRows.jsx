import { Link } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Button } from '@/shared/ui'
import { formatCoins, formatDateTime, formatFee, statusLabels, typeLabels } from '../format'
import styles from './TournamentRows.module.css'

// One line per tournament; scheduled ones can start early or be cancelled. The name opens the players' page.
export default function TournamentRows({ tournaments, busyId, onStart, onCancel }) {
  return <ul className={styles.rows}>
    {tournaments.map(tournament => <li key={tournament.id} className={styles.row}>
      <div className={styles.main}>
        <div className={styles.top}>
          <Link to={paths.tournamentById(tournament.id)} className={styles.name}>{tournament.name}</Link>
          <span className={`${styles.tag} ${tournament.type === 'ELITE' ? styles.elite : ''}`}>{typeLabels[tournament.type]}</span>
          <span className={`${styles.tag} ${tournament.status === 'CANCELLED' ? styles.cancelled : ''}`}>{statusLabels[tournament.status]}</span>
        </div>
        <span className={styles.meta}>{formatDateTime(tournament.startAt)} · {formatFee(tournament.entryFee)} ·
          {` ${tournament.entryCount} / ${tournament.slots} players`} · pool {formatCoins(tournament.prizePool)}</span>
      </div>
      {tournament.status === 'SCHEDULED' && <div className={styles.actions}>
        <Button disabled={busyId === tournament.id} onClick={() => onStart(tournament)}>Start now</Button>
        <Button variant="danger" disabled={busyId === tournament.id} onClick={() => onCancel(tournament)}>Cancel</Button>
      </div>}
    </li>)}
  </ul>
}
