import CardBack from './CardBack'

const ranks = { TWO: '2', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7', EIGHT: '8', NINE: '9', TEN: '10', JACK: 'J', QUEEN: 'Q', KING: 'K', ACE: 'A' }
const suits = { SPADES: '♠', CLUBS: '♣', HEARTS: '♥', DIAMONDS: '♦' }

export default function PlayingCard({ card }) {
  if (!card) return <CardBack />
  const label = `${ranks[card.rank]}${suits[card.suit]}`
  return <div className={`game-card game-card-${card.suit.toLowerCase()}`} aria-label={label}>
    <span>{ranks[card.rank]}<small>{suits[card.suit]}</small></span>
    <strong>{suits[card.suit]}</strong><span className="game-card-bottom">{label}</span>
  </div>
}
