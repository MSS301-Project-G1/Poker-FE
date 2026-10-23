import { PlayingCard } from '@/shared/skin'
import { Icon } from '@/shared/ui'
import { label, streetLabels } from '../labels'
import styles from './Board.module.css'

const slotStreets = ['FLOP', 'FLOP', 'FLOP', 'TURN', 'RIVER']

// revealDelays[i] turns community card i over after that many ms. result is the winner line once the hand is settled.
export default function Board({ cards, pot, distribution, street, revealDelays = [], result, badge }) {
  const total = distribution ? distribution.pots.reduce((sum, award) => sum + award.amount, 0) : pot
  return <div className={styles.board}>
    {/* After a hand the street tag becomes the pot results toggle, so the board keeps its height and stays clear of your cards. */}
    <div className={`${styles.pot} ${result ? styles.result : ''}`} data-pot>
      <Icon name={result ? 'emoji_events' : 'monetization_on'} filled />
      <span>{result ?? <>TỔNG POT: <strong>{total.toLocaleString()}</strong> CHIPS</>}</span>
      {result ? <details className={styles.awards}><summary>KẾT QUẢ · {distribution.pots.length}</summary><div>{distribution.pots.map((award, index) => <span key={index}>
        {index === 0 ? 'Pot chính' : `Pot phụ ${index}`}: {award.amount.toLocaleString()} → {award.winnerSeats.map(seat => `Ghế ${seat + 1}`).join(', ')}
      </span>)}</div></details> : <small>{label(streetLabels, street)}</small>}
    </div>
    <div className={styles.community} aria-label="Community cards" data-community-cards>
      {Array.from({ length: 5 }, (_, index) => {
        const revealing = revealDelays[index] !== undefined
        return <div key={index} className={styles.cell}>
          {/* The empty slot stays under a card that is still waiting to turn over. */}
          {(!cards[index] || revealing) && <div className={styles.slot} aria-label={cards[index] ? undefined : 'Unrevealed community card'} aria-hidden={cards[index] ? true : undefined}>
            <Icon name="lock" /><span>{slotStreets[index]}</span></div>}
          {cards[index] && <PlayingCard card={cards[index]} size="lg" revealDelay={revealDelays[index]} />}
        </div>
      })}
      {badge && <div className={styles.badge}>{badge}</div>}
    </div>
  </div>
}
