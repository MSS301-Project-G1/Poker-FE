import { Icon } from '@/shared/ui'
import styles from './HandGuide.module.css'

const hands = ['Straight flush', 'Four of a kind', 'Full house', 'Flush', 'Straight', 'Three of a kind', 'Two pair', 'One pair', 'High card']

export default function HandGuide() {
  return <details className={styles.guide}><summary><Icon name="style" className={styles.icon} /> Hand rankings</summary>
    <div className={styles.popover}><strong>STRONGEST TO WEAKEST</strong><ol>{hands.map(hand => <li key={hand}>{hand}</li>)}</ol><p>The best five of seven cards wins. A–2–3–4–5 is the lowest straight. Equal hands split the pot.</p></div>
  </details>
}
