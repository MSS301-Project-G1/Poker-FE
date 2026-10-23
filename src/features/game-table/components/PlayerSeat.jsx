import { AvatarFrame, Dealer, PlayingCard } from '@/shared/skin'
import { Icon } from '@/shared/ui'
import { actionLabels, handLabels, label, playerName } from '../labels'
import ChipStack from './ChipStack'
import styles from './PlayerSeat.module.css'

const actionTones = { FOLD: 'muted', CHECK: 'calm', CALL: 'calm', RAISE: 'hot', ALL_IN: 'hot' }

/**
 * slot places the seat on the rail; the viewer's own seat (isYou) shows its cards beside the name plate, never under it.
 * chips and bet are what the table shows right now (winnings wait for the pot to arrive; bets leave when a street ends).
 * revealDelays turn the hole cards over; turnMillis drains the active player's timer bar; showHand shows the showdown hand;
 * paid bumps the stack when a won pot lands.
 */
export default function PlayerSeat({ player, profile, slot, isYou, active, dealer, smallBlind, bigBlind, winner,
  chips, bet, revealDelays, turnMillis, turnKey, showHand, paid }) {
  const name = playerName(profile, player.accountId)
  const state = [styles[slot], isYou && styles.hero, active && styles.active, player.folded && styles.folded, winner && styles.winner].filter(Boolean).join(' ')
  const status = player.eliminated ? `Place #${player.place}` : player.leftEarly ? 'Left table'
    : label(actionLabels, player.lastAction) || (active ? 'Thinking…' : 'Waiting')
  return <div className={`${styles.seat} ${state}`} data-seat={player.seatIndex} data-hero={isYou || undefined}>
    <div className={styles.plate} data-plate>
      <div className={styles.avatar}>
        <AvatarFrame avatarUrl={profile?.avatarUrl} name={name} size={isYou ? 'lg' : 'md'} />
        <div className={styles.badges}>{dealer && <Dealer />}{smallBlind && <span className={styles.badge}>SB</span>}{bigBlind && <span className={styles.badge}>BB</span>}</div>
      </div>
      <div className={styles.identity}>
        <strong>{name}{isYou && <small>BẠN</small>}</strong>
        <span className={`${styles.stack} ${paid ? styles.paid : ''}`}><Icon name="toll" />{chips.toLocaleString()}</span>
        <span className={styles.status} data-tone={actionTones[player.lastAction]}>{status}</span>
      </div>
      {turnMillis > 0 && <i key={turnKey} className={styles.turnBar} style={{ '--turn-ms': `${turnMillis}ms` }} aria-hidden="true" />}
    </div>
    {/* The showdown hand label hangs on the cards' lower edge, so it never needs room of its own. */}
    <div className={styles.hand}>
      <div className={styles.holeCards} aria-label={isYou ? 'Your cards' : `${name}'s cards`}>
        {Array.from({ length: player.holeCardCount }, (_, index) => <span key={index} className={styles.cardSlot} data-card-slot>
          <PlayingCard card={player.cards[index]} size={isYou ? 'xl' : 'sm'} revealDelay={revealDelays?.[index]} />
        </span>)}
      </div>
      {showHand && player.handRank && <span className={styles.handRank}>{label(handLabels, player.handRank.category)}</span>}
    </div>
    {/* Keyed by the amount so every new bet slides in. */}
    {bet > 0 && <span key={bet} className={styles.bet} data-bet-seat={player.seatIndex}><ChipStack amount={bet} /></span>}
  </div>
}
