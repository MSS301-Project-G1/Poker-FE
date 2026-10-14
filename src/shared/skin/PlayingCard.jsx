import CardBack from './CardBack'
import styles from './skin.module.css'

const ranks = { TWO: '2', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7', EIGHT: '8', NINE: '9', TEN: '10', JACK: 'J', QUEEN: 'Q', KING: 'K', ACE: 'A' }
const suits = { SPADES: '♠', CLUBS: '♣', HEARTS: '♥', DIAMONDS: '♦' }

/** @param {{ card?: { rank: string, suit: string }, size?: 'md' | 'lg' }} props  No card renders the back. */
export default function PlayingCard({ card, size = 'md' }) {
  if (!card) return <CardBack size={size} />
  const label = `${ranks[card.rank]}${suits[card.suit]}`
  return <div className={`${styles.card} ${styles[size]} ${styles[card.suit.toLowerCase()] || ''}`} aria-label={label}>
    <span>{ranks[card.rank]}<small>{suits[card.suit]}</small></span>
    <strong>{suits[card.suit]}</strong><span className={styles.corner}>{label}</span>
  </div>
}
