import { VictoryEffect } from '@/shared/skin'
import { Button, Icon } from '@/shared/ui'
import styles from './MatchResult.module.css'

export default function MatchResult({ mode, placements, accountId, profiles, rewards, onExit }) {
  const sorted = [...placements].sort((a, b) => a.place - b.place)
  const own = sorted.find(player => player.accountId === accountId)
  return <div className={styles.backdrop}><section className={styles.dialog} role="dialog" aria-modal="true" aria-label="Match results">
    <VictoryEffect><Icon name="emoji_events" className={styles.trophy} /><p>MATCH COMPLETE</p><h1>{own?.place === 1 ? 'Victory is yours.' : `You finished #${own?.place ?? '—'}`}</h1></VictoryEffect>
    <p className={styles.muted}>Every hand counted. Here are the final standings.</p>
    <table className={styles.standings}><thead><tr><th>Place</th><th>Player</th><th>Final chips</th></tr></thead><tbody>{sorted.map(player => <tr key={player.accountId} className={player.accountId === accountId ? styles.you : ''}>
      <td>#{player.place}</td><td>{profiles[player.accountId]?.displayName || `Player ${player.accountId.slice(-6)}`}{player.accountId === accountId && ' · You'}</td><td>{player.finalChips.toLocaleString()}</td>
    </tr>)}</tbody></table>
    {mode === 'RANK' && <div className={styles.rewards}>{rewards ? <><span>Elo change: {rewards.eloDelta ?? 'Pending'}</span><span>Coins earned: {rewards.coins ?? 'Pending'}</span></> : <p>Rank and wallet updates appear once your rewards are processed.</p>}</div>}
    <Button variant="primary" autoFocus onClick={onExit}>Back to lobby</Button>
  </section></div>
}
