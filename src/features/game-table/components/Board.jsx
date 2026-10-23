import { PlayingCard } from '@/shared/skin'
import { Icon } from '@/shared/ui'
import { label, streetLabels } from '../labels'
import styles from './Board.module.css'

const slotStreets = ['FLOP', 'FLOP', 'FLOP', 'TURN', 'RIVER']

export default function Board({ cards, pot, distribution, street }) {
  const lastPot = distribution?.pots.reduce((total, item) => total + item.amount, 0)
  return <div className={styles.board}>
    {/* After a hand the street tag becomes the pot results toggle, so the board keeps its height and stays clear of your cards. */}
    <div className={styles.pot}><Icon name="monetization_on" filled /><span>{distribution ? 'POT VỪA RỒI' : 'TỔNG POT'}: <strong>{(distribution ? lastPot : pot).toLocaleString()}</strong> CHIPS</span>
      {distribution ? <details className={styles.awards}><summary>KẾT QUẢ · {distribution.pots.length}</summary><div>{distribution.pots.map((award, index) => <span key={index}>
        {index === 0 ? 'Pot chính' : `Pot phụ ${index}`}: {award.amount.toLocaleString()} → {award.winnerSeats.map(seat => `Ghế ${seat + 1}`).join(', ')}
      </span>)}</div></details> : <small>{label(streetLabels, street)}</small>}</div>
    <div className={styles.community} aria-label="Community cards">
      {Array.from({ length: 5 }, (_, index) => cards[index]
        ? <PlayingCard key={index} card={cards[index]} size="lg" />
        : <div key={index} className={styles.slot} aria-label="Unrevealed community card"><Icon name="lock" /><span>{slotStreets[index]}</span></div>)}
    </div>
  </div>
}
