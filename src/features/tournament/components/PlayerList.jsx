import { entryLabels, placeLabel, playerName } from '../format'
import styles from './PlayerList.module.css'

const order = { CONFIRMED: 0, REGISTERED: 0, INVITED: 1, ELIMINATED: 2, EXPIRED: 3 }
const out = new Set(['ELIMINATED', 'EXPIRED'])

// Final places first, then players still in, invitations, knocked-out players and expired invitations.
export default function PlayerList({ entries, profiles, accountId }) {
  const sorted = [...entries].sort((a, b) => (a.finalPlace ?? Infinity) - (b.finalPlace ?? Infinity)
    || order[a.status] - order[b.status] || Date.parse(a.registeredAt) - Date.parse(b.registeredAt))
  return <ul className={styles.list} aria-label="Players">
    {sorted.map(entry => {
      const name = playerName(profiles, entry.accountId)
      const you = entry.accountId === accountId
      return <li key={entry.accountId} className={`${styles.player} ${you ? styles.you : ''} ${out.has(entry.status) ? styles.out : ''}`}>
        <span className={styles.avatar} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
        <span className={styles.name}><span className={styles.text}>{name}</span>{you && <em className={styles.tag}>You</em>}</span>
        <span className={`${styles.status} ${entry.finalPlace ? styles.placed : ''}`}>
          {entry.finalPlace ? placeLabel(entry.finalPlace) : entryLabels[entry.status]}</span>
      </li>
    })}
  </ul>
}
