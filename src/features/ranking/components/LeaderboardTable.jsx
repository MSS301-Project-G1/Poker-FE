import TierBadge from './TierBadge'
import styles from './LeaderboardTable.module.css'

const columns = [['Rank'], ['Player'], ['Tier'], ['Elo'], ['Win streak', true], ['Matches', true]]
const placeClass = { 1: styles.place1, 2: styles.place2, 3: styles.place3 }

export default function LeaderboardTable({ players, profiles, accountId }) {
  return <table className={styles.table}>
    <thead><tr>{columns.map(([label, optional]) =>
      <th key={label} scope="col" className={`${styles.head} ${optional ? styles.optional : ''}`}>{label}</th>)}</tr></thead>
    <tbody>{players.map(player => {
      const you = player.accountId === accountId
      return <tr key={player.accountId} className={`${styles.row} ${you ? styles.you : ''}`}>
        <td className={styles.cell}><span className={`${styles.place} ${placeClass[player.position] || ''}`}>{player.position}</span></td>
        <td className={styles.cell}>{profiles[player.accountId]?.displayName || `Player ${player.accountId.slice(-6)}`}
          {you && <small className={styles.youTag}> · You</small>}</td>
        <td className={styles.cell}><TierBadge tier={player.tier} /></td>
        <td className={`${styles.cell} ${styles.number}`}>{player.elo.toLocaleString()}</td>
        <td className={`${styles.cell} ${styles.number} ${styles.optional}`}>{player.winStreak}</td>
        <td className={`${styles.cell} ${styles.number} ${styles.optional}`}>{player.matchesPlayed}</td>
      </tr>
    })}</tbody>
  </table>
}
