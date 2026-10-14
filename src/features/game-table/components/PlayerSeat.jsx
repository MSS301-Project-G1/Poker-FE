import { AvatarFrame, Dealer, PlayingCard } from '@/shared/skin'
import styles from './PlayerSeat.module.css'

export default function PlayerSeat({ player, profile, isYou, active, dealer, smallBlind, bigBlind, winner }) {
  const name = profile?.displayName || `Player ${player.accountId.slice(-6)}`
  const state = [active && styles.active, player.folded && styles.folded, winner && styles.winner].filter(Boolean).join(' ')
  return <div className={`${styles.seat} ${state}`} data-seat={player.seatIndex}>
    <div className={styles.info}>
      <AvatarFrame avatarUrl={profile?.avatarUrl} name={name} />
      <div><strong>{name} {isYou && <small>YOU</small>}</strong><span className={styles.stack}>{player.chips.toLocaleString()} chips</span></div>
      <div className={styles.badges}>{dealer && <Dealer />}{smallBlind && <span className={styles.badge}>SB</span>}{bigBlind && <span className={styles.badge}>BB</span>}</div>
    </div>
    <div className={styles.footer}><span>{player.eliminated ? `Finished #${player.place}` : player.leftEarly ? 'Left table' : player.lastAction?.replaceAll('_', ' ') || (active ? 'Thinking…' : 'Waiting')}</span>
      {player.streetBet > 0 && <span className={styles.bet}>{player.streetBet.toLocaleString()}</span>}</div>
    <div className={styles.holeCards} aria-label={isYou ? 'Your cards' : `${name}'s cards`}>
      {Array.from({ length: player.holeCardCount }, (_, index) => <PlayingCard key={index} card={player.cards[index]} />)}
    </div>
    {player.handRank && <span className={styles.handRank}>{player.handRank.category.replaceAll('_', ' ')}</span>}
  </div>
}
