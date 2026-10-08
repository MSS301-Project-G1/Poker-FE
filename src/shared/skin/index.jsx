const ranks = { TWO: '2', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7', EIGHT: '8', NINE: '9', TEN: '10', JACK: 'J', QUEEN: 'Q', KING: 'K', ACE: 'A' }
const suits = { SPADES: '♠', CLUBS: '♣', HEARTS: '♥', DIAMONDS: '♦' }

// Default skins only. Equipped assets can be supplied by the inventory owner.
export function CardBack() {
  return <div className="game-card game-card-back" aria-label="Hidden card"><span>♠</span></div>
}

export function PlayingCard({ card }) {
  if (!card) return <CardBack />
  const label = `${ranks[card.rank]}${suits[card.suit]}`
  return <div className={`game-card game-card-${card.suit.toLowerCase()}`} aria-label={label}>
    <span>{ranks[card.rank]}<small>{suits[card.suit]}</small></span>
    <strong>{suits[card.suit]}</strong><span className="game-card-bottom">{label}</span>
  </div>
}

export function TableTheme({ children }) {
  return <div className="game-felt">{children}</div>
}

export function AvatarFrame({ avatarUrl, name }) {
  return <div className="game-avatar">{avatarUrl ? <img src={avatarUrl} alt={name} /> : <span>{name.slice(0, 1).toUpperCase()}</span>}</div>
}

export function Dealer() {
  return <span className="game-badge game-badge-dealer" title="Dealer">D</span>
}

export function VictoryEffect({ children }) {
  return <div className="game-victory">{children}</div>
}
