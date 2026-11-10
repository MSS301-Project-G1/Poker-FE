import { Link } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'
import { formatCoins, formatDateTime, formatFee, timeUntil } from '../format'
import TournamentTags from './TournamentTags'
import styles from './TournamentCard.module.css'

export default function TournamentCard({ tournament, now }) {
  const { id, name, type, status, startAt, entryFee, entryCount, slots, prizePool } = tournament
  return <li>
    <Link to={paths.tournamentById(id)} className={styles.card}>
      <TournamentTags type={type} status={status} />
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.when}>
        <Icon name="schedule" className={styles.icon} />{formatDateTime(startAt)}
        {status === 'SCHEDULED' && <span className={styles.countdown}>Starts {timeUntil(startAt, now)}</span>}
      </p>
      <dl className={styles.stats}>
        <div><dt>Entry</dt><dd>{formatFee(entryFee)}</dd></div>
        <div><dt>Players</dt><dd>{entryCount} / {slots}</dd></div>
        <div><dt>Prize pool</dt><dd className={styles.prize}>{prizePool > 0 ? formatCoins(prizePool) : '—'}</dd></div>
      </dl>
    </Link>
  </li>
}
