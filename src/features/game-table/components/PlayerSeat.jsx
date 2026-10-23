import { AvatarFrame, Dealer, PlayingCard } from '@/shared/skin'
import { Icon } from '@/shared/ui'
import { actionLabels, handLabels, label } from '../labels'
import styles from './PlayerSeat.module.css'

const actionTones = { FOLD: 'muted', CHECK: 'calm', CALL: 'calm', RAISE: 'hot', ALL_IN: 'hot' }

// slot places the seat on the rail; the viewer's own seat (isYou) shows its cards beside the name plate, never under it.
export default function PlayerSeat({ player, profile, slot, isYou, active, dealer, smallBlind, bigBlind, winner, badge }) {
  const name = profile?.displayName || `Người chơi ${player.accountId.slice(-6)}`
  const state = [styles[slot], isYou && styles.hero, active && styles.active, player.folded && styles.folded, winner && styles.winner].filter(Boolean).join(' ')
  const status = player.eliminated ? `Place #${player.place}` : player.leftEarly ? 'Left table'
    : label(actionLabels, player.lastAction) || (active ? 'Thinking…' : 'Waiting')
  return <div className={`${styles.seat} ${state}`} data-seat={player.seatIndex} data-hero={isYou || undefined}>
    {badge && <div className={styles.turn}>{badge}</div>}
    <div className={styles.plate}>
      <div className={styles.avatar}>
        <AvatarFrame avatarUrl={profile?.avatarUrl} name={name} size={isYou ? 'lg' : 'md'} />
        <div className={styles.badges}>{dealer && <Dealer />}{smallBlind && <span className={styles.badge}>SB</span>}{bigBlind && <span className={styles.badge}>BB</span>}</div>
      </div>
      <div className={styles.identity}>
        <strong>{name}{isYou && <small>BẠN</small>}</strong>
        <span className={styles.stack}><Icon name="toll" />{player.chips.toLocaleString()}</span>
        <span className={styles.status} data-tone={actionTones[player.lastAction]}>{status}</span>
      </div>
    </div>
    {/* The showdown hand label hangs on the cards' lower edge, so it never needs room of its own. */}
    <div className={styles.hand}>
      <div className={styles.holeCards} aria-label={isYou ? 'Your cards' : `${name}'s cards`}>
        {Array.from({ length: player.holeCardCount }, (_, index) => <PlayingCard key={index} card={player.cards[index]} size={isYou ? 'xl' : 'sm'} />)}
      </div>
      {player.handRank && <span className={styles.handRank}>{label(handLabels, player.handRank.category)}</span>}
    </div>
    {player.streetBet > 0 && <span className={styles.bet}><i />{player.streetBet.toLocaleString()}</span>}
  </div>
}
