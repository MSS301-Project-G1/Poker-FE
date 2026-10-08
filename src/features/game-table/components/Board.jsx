import { PlayingCard } from '../../../shared/skin'

export default function Board({ cards, pot, distribution }) {
  const lastPot = distribution?.pots.reduce((total, item) => total + item.amount, 0)
  return <div className="game-board">
    <div className="game-pot"><span>{distribution ? 'LAST POT' : 'TOTAL POT'}</span><strong>{(distribution ? lastPot : pot).toLocaleString()} <small>CHIPS</small></strong></div>
    <div className="game-community" aria-label="Community cards">
      {Array.from({ length: 5 }, (_, index) => cards[index]
        ? <PlayingCard key={index} card={cards[index]} />
        : <div key={index} className="game-card-slot" aria-label="Unrevealed community card" />)}
    </div>
    {distribution && <details className="game-pot-awards"><summary>Pot results · {distribution.pots.length}</summary><div>{distribution.pots.map((award, index) => <span key={index}>
      {index === 0 ? 'Main pot' : `Side pot ${index}`}: {award.amount.toLocaleString()} → {award.winnerSeats.map(seat => `Seat ${seat + 1}`).join(', ')}
    </span>)}</div></details>}
  </div>
}
