import { formatDateTime, formatFee, timeUntil } from '../format'
import Message from './Message'
import TournamentTags from './TournamentTags'
import styles from './TournamentHeading.module.css'

export default function TournamentHeading({ tournament, now, connectionError }) {
  const { type, status, name, startAt, entryFee, slots } = tournament
  return <section className={styles.heading}>
    <TournamentTags type={type} status={status} />
    <h1 className={styles.title}>{name}</h1>
    <p className={styles.muted}>
      {formatDateTime(startAt)}{status === 'SCHEDULED' && <strong className={styles.countdown}> · starts {timeUntil(startAt, now)}</strong>}
      {' · '}{formatFee(entryFee)} · {slots} places · {type === 'ELITE' ? 'Invitation from the leaderboard' : 'First come, first served'}
    </p>
    {connectionError && <Message tone="notice">Connection issue: {connectionError} Retrying…</Message>}
  </section>
}
