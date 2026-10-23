import { AvatarFrame, VictoryEffect } from '@/shared/skin'
import { Button, Icon } from '@/shared/ui'
import { playerName } from '../labels'
import styles from './MatchResult.module.css'

// The podium places get their own medal colours; everyone below shares the plain one.
const medals = { 1: styles.gold, 2: styles.silver, 3: styles.bronze }

export default function MatchResult({ mode, placements, accountId, profiles, rewards, onExit }) {
  const sorted = [...placements].sort((a, b) => a.place - b.place)
  const own = sorted.find(player => player.accountId === accountId)
  const won = own?.place === 1
  return <div className={styles.backdrop}><section className={`${styles.dialog} ${won ? styles.won : ''}`} role="dialog" aria-modal="true" aria-label="Match results">
    <VictoryEffect>
      <div className={styles.emblem} aria-hidden="true">{won ? <Icon name="emoji_events" filled /> : <strong>#{own?.place ?? '—'}</strong>}</div>
      <p>MATCH COMPLETE</p>
      <h1 className={styles.title}>{won ? 'Victory is yours.' : `You finished #${own?.place ?? '—'}`}</h1>
    </VictoryEffect>
    <p className={styles.muted}>Every hand counted. Here are the final standings.</p>
    <ol className={styles.standings} aria-label="Final standings">{sorted.map((player, index) => {
      const you = player.accountId === accountId
      const name = playerName(profiles[player.accountId], player.accountId)
      return <li key={player.accountId} className={`${styles.row} ${player.place === 1 ? styles.champion : ''} ${you ? styles.you : ''}`} style={{ '--row': index }}>
        <span className={`${styles.medal} ${medals[player.place] ?? ''}`}>{player.place}</span>
        <AvatarFrame avatarUrl={profiles[player.accountId]?.avatarUrl} name={name} />
        <span className={styles.name}><strong title={name}>{name}</strong>{you && <small>YOU</small>}</span>
        <span className={styles.chips}><Icon name="toll" />{player.finalChips.toLocaleString()}</span>
      </li>
    })}</ol>
    {mode === 'RANK' && <div className={styles.rewards}>
      <Reward icon={rewards?.eloDelta < 0 ? 'trending_down' : 'trending_up'} label="Elo change" value={rewards?.eloDelta} />
      <Reward icon="paid" label="Coins earned" value={rewards?.coins} />
      {!rewards && <p>Rank and wallet updates appear once your rewards are processed.</p>}
    </div>}
    <Button variant="primary" className={styles.exit} autoFocus onClick={onExit}>Back to lobby</Button>
  </section></div>
}

function Reward({ icon, label, value }) {
  const pending = value === undefined || value === null
  return <div className={`${styles.reward} ${value < 0 ? styles.loss : ''}`}>
    <span>{label}</span>
    <strong><Icon name={icon} />{pending ? 'Pending' : `${value > 0 ? '+' : ''}${value.toLocaleString()}`}</strong>
  </div>
}
