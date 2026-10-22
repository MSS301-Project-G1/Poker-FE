import TierBadge from './TierBadge'
import styles from './LeaderboardTable.module.css'

const placeClass = { 1: styles.place1, 2: styles.place2, 3: styles.place3 }

/**
 * Season rows carry `position`; friends rows carry `rank` among friends, the season `position`
 * (null before a ranked match) and `you`.
 */
export default function LeaderboardTable({ players, profiles, accountId, friends = false }) {
  const columns = [['Rank'], ['Player'], ['Tier'], ['Elo'], ...(friends ? [['Server rank']] : []),
    ['Win streak', true], ['Matches', true]]
  return <table className={styles.table}>
    <thead><tr>{columns.map(([label, optional]) =>
      <th key={label} scope="col" className={`${styles.head} ${optional ? styles.optional : ''}`}>{label}</th>)}</tr></thead>
    <tbody>{players.map(player => {
      const you = friends ? player.you : player.accountId === accountId
      const place = friends ? player.rank : player.position
      return <tr key={player.accountId} className={`${styles.row} ${you ? styles.you : ''}`}>
        <td className={styles.cell}><span className={`${styles.place} ${placeClass[place] || ''}`}>{place}</span></td>
        <td className={styles.cell}>{profiles[player.accountId]?.displayName || `Player ${player.accountId.slice(-6)}`}
          {you && <small className={styles.youTag}> · You</small>}</td>
        <td className={styles.cell}><TierBadge tier={player.tier} /></td>
        <td className={`${styles.cell} ${styles.number}`}>{player.elo.toLocaleString()}</td>
        {friends && <td className={`${styles.cell} ${styles.number}`}>
          {player.position ? `#${player.position.toLocaleString()}` : <span className={styles.unranked}>Unranked</span>}</td>}
        <td className={`${styles.cell} ${styles.number} ${styles.optional}`}>{player.winStreak}</td>
        <td className={`${styles.cell} ${styles.number} ${styles.optional}`}>{player.matchesPlayed}</td>
      </tr>
    })}</tbody>
  </table>
}
