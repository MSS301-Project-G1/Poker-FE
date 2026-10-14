import { PlayingCard } from '@/shared/skin'
import styles from './Board.module.css'

export default function Board({ cards, pot, distribution }) {
  const lastPot = distribution?.pots.reduce((total, item) => total + item.amount, 0)
  return <div>
    <div className={styles.pot}><span>{distribution ? 'LAST POT' : 'TOTAL POT'}</span><strong>{(distribution ? lastPot : pot).toLocaleString()} <small>CHIPS</small></strong></div>
    <div className={styles.community} aria-label="Community cards">
      {Array.from({ length: 5 }, (_, index) => cards[index]
        ? <PlayingCard key={index} card={cards[index]} size="lg" />
        : <div key={index} className={styles.slot} aria-label="Unrevealed community card" />)}
    </div>
    {distribution && <details className={styles.awards}><summary>Pot results · {distribution.pots.length}</summary><div>{distribution.pots.map((award, index) => <span key={index}>
      {index === 0 ? 'Main pot' : `Side pot ${index}`}: {award.amount.toLocaleString()} → {award.winnerSeats.map(seat => `Seat ${seat + 1}`).join(', ')}
    </span>)}</div></details>}
  </div>
}
