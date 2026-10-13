import TierBadge from './TierBadge'

export default function LeaderboardTable({ players, profiles, accountId }) {
  return <table className="ranking-table">
    <thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">Tier</th><th scope="col">Elo</th><th scope="col" className="ranking-optional">Win streak</th><th scope="col" className="ranking-optional">Matches</th></tr></thead>
    <tbody>{players.map(player => <tr key={player.accountId} className={player.accountId === accountId ? 'ranking-you' : ''}>
      <td><span className={`ranking-place ${player.position <= 3 ? `ranking-place-${player.position}` : ''}`}>{player.position}</span></td>
      <td>{profiles[player.accountId]?.displayName || `Player ${player.accountId.slice(-6)}`}{player.accountId === accountId && <small> · You</small>}</td>
      <td><TierBadge tier={player.tier} /></td>
      <td className="ranking-number">{player.elo.toLocaleString()}</td>
      <td className="ranking-number ranking-optional">{player.winStreak}</td>
      <td className="ranking-number ranking-optional">{player.matchesPlayed}</td>
    </tr>)}</tbody>
  </table>
}
