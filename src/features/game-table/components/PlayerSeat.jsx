import { AvatarFrame, Dealer, PlayingCard } from '../../../shared/skin'

export default function PlayerSeat({ player, profile, isYou, active, dealer, smallBlind, bigBlind, winner }) {
  const name = profile?.displayName || `Player ${player.accountId.slice(-6)}`
  return <div className={`game-seat ${active ? 'game-seat-active' : ''} ${player.folded ? 'game-seat-folded' : ''} ${winner ? 'game-seat-winner' : ''}`} data-seat={player.seatIndex}>
    <div className="game-seat-info">
      <AvatarFrame avatarUrl={profile?.avatarUrl} name={name} />
      <div><strong>{name} {isYou && <small>YOU</small>}</strong><span className="game-stack">{player.chips.toLocaleString()} chips</span></div>
      <div className="game-seat-badges">{dealer && <Dealer />}{smallBlind && <span className="game-badge">SB</span>}{bigBlind && <span className="game-badge">BB</span>}</div>
    </div>
    <div className="game-seat-footer"><span>{player.eliminated ? `Finished #${player.place}` : player.leftEarly ? 'Left table' : player.lastAction?.replaceAll('_', ' ') || (active ? 'Thinking…' : 'Waiting')}</span>
      {player.streetBet > 0 && <span className="game-bet">{player.streetBet.toLocaleString()}</span>}</div>
    <div className="game-hole-cards" aria-label={isYou ? 'Your cards' : `${name}'s cards`}>
      {Array.from({ length: player.holeCardCount }, (_, index) => <PlayingCard key={index} card={player.cards[index]} />)}
    </div>
    {player.handRank && <span className="game-hand-rank">{player.handRank.category.replaceAll('_', ' ')}</span>}
  </div>
}
