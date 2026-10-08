import { VictoryEffect } from '../../../shared/skin'

export default function MatchResult({ mode, placements, accountId, profiles, rewards, onExit }) {
  const sorted = [...placements].sort((a, b) => a.place - b.place)
  const own = sorted.find(player => player.accountId === accountId)
  return <div className="game-result-backdrop"><section className="game-result" role="dialog" aria-modal="true" aria-label="Match results">
    <VictoryEffect><span className="material-symbols-outlined game-trophy">emoji_events</span><p>MATCH COMPLETE</p><h1>{own?.place === 1 ? 'Victory is yours.' : `You finished #${own?.place ?? '—'}`}</h1></VictoryEffect>
    <p className="game-muted">Every hand counted. Here are the final standings.</p>
    <table><thead><tr><th>Place</th><th>Player</th><th>Final chips</th></tr></thead><tbody>{sorted.map(player => <tr key={player.accountId} className={player.accountId === accountId ? 'game-result-you' : ''}>
      <td>#{player.place}</td><td>{profiles[player.accountId]?.displayName || `Player ${player.accountId.slice(-6)}`}{player.accountId === accountId && ' · You'}</td><td>{player.finalChips.toLocaleString()}</td>
    </tr>)}</tbody></table>
    {mode === 'RANK' && <div className="game-result-rewards">{rewards ? <><span>Elo change: {rewards.eloDelta ?? 'Pending'}</span><span>Coins earned: {rewards.coins ?? 'Pending'}</span></> : <p>Rank and wallet updates appear once your rewards are processed.</p>}</div>}
    <button className="game-primary" autoFocus onClick={onExit}>Back to lobby</button>
  </section></div>
}
