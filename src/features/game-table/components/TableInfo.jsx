import { Icon } from '@/shared/ui'
import { handLabels, label, streetLabels } from '../labels'
import styles from './TableInfo.module.css'

// Hand facts from the snapshot. The game service has no win odds, so this panel shows none.
export default function TableInfo({ snapshot, me }) {
  const inHand = snapshot.seats.filter(seat => !seat.folded && !seat.eliminated && !seat.leftEarly).length
  const facts = [
    ['Tổng pot', snapshot.pot.toLocaleString()],
    ['Cược vòng này', snapshot.currentBet.toLocaleString()],
    ['Bạn đã cược', (me?.streetBet ?? 0).toLocaleString()],
    ['Còn trong ván', `${inHand}/${snapshot.seats.length}`],
  ]
  return <section className={styles.panel} aria-label="Thông tin ván">
    <header><span><Icon name="query_stats" /> THÔNG TIN VÁN</span><small>{label(streetLabels, snapshot.street)}</small></header>
    <p className={styles.hand}>{me?.handRank ? <>Tay bài của bạn: <strong>{label(handLabels, me.handRank.category)}</strong></>
      : snapshot.legalActions.includes('CALL') ? <>Cần theo <strong>{snapshot.callAmount.toLocaleString()}</strong> chip để ở lại ván.</>
        : 'Theo dõi pot và lượt cược của bàn.'}</p>
    <dl>{facts.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
  </section>
}
