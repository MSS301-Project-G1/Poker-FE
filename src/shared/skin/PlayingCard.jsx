import CardBack from './CardBack'
import CardImage from './CardImage'
import { useSkin } from './SkinContext'
import { cardFlipMillis } from './motion'
import styles from './skin.module.css'

const ranks = { TWO: '2', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7', EIGHT: '8', NINE: '9', TEN: '10', JACK: 'J', QUEEN: 'Q', KING: 'K', ACE: 'A' }
const suits = { SPADES: '♠', CLUBS: '♣', HEARTS: '♥', DIAMONDS: '♦' }
// Deck skins name each face by rank and suit letter, e.g. AS or 10H.
const suitCodes = { SPADES: 'S', CLUBS: 'C', HEARTS: 'H', DIAMONDS: 'D' }

/**
 * @param {{ card?: { rank: string, suit: string }, size?: 'sm' | 'md' | 'lg' | 'xl', revealDelay?: number }} props
 *   No card renders the back. With revealDelay (ms) the card shows its back, then turns face up.
 */
export default function PlayingCard({ card, size = 'md', revealDelay }) {
  const { cards } = useSkin()
  if (!card) return <CardBack size={size} />
  const label = `${ranks[card.rank]}${suits[card.suit]}`
  const defaultFace = <div className={`${styles.card} ${styles[size]} ${styles[card.suit.toLowerCase()] || ''}`} aria-label={label}>
    <span>{ranks[card.rank]}<small>{suits[card.suit]}</small></span>
    <strong>{suits[card.suit]}</strong><span className={styles.corner}>{label}</span>
  </div>
  const image = cards?.[`${ranks[card.rank]}${suitCodes[card.suit]}`]
  const face = image ? <CardImage src={image} className={`${styles.card} ${styles[size]}`} label={label}>{defaultFace}</CardImage> : defaultFace
  if (revealDelay === undefined) return face
  return <div className={styles.flip} style={{ '--reveal-delay': `${revealDelay}ms`, '--flip-ms': `${cardFlipMillis}ms` }}>{face}<CardBack size={size} decorative /></div>
}
