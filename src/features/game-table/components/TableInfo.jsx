import { Icon } from '@/shared/ui'
import { handLabels, label, streetLabels } from '../labels'
import styles from './TableInfo.module.css'

// Hand facts from the snapshot. The game service has no win odds, so this panel shows none.
export default function TableInfo({ snapshot, me }) {
  const inHand = snapshot.seats.filter(seat => !seat.folded && !seat.eliminated && !seat.leftEarly).length
  const facts = [
    ['Total pot', snapshot.pot.toLocaleString()],
    ['Bets this round', snapshot.currentBet.toLocaleString()],
    ['Your bet', (me?.streetBet ?? 0).toLocaleString()],
    ['Still in hand', `${inHand}/${snapshot.seats.length}`],
  ]
  return <section className={styles.panel} aria-label="Hand info">
    <header><span><Icon name="query_stats" /> HAND INFO</span><small>{label(streetLabels, snapshot.street)}</small></header>
    <p className={styles.hand}>{me?.handRank ? <>Your hand: <strong>{label(handLabels, me.handRank.category)}</strong></>
      : snapshot.legalActions.includes('CALL') ? <>Call <strong>{snapshot.callAmount.toLocaleString()}</strong> chips to stay in the hand.</>
        : 'Pot and betting for this table.'}</p>
    <dl>{facts.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
  </section>
}
