import styles from './ChipStack.module.css'

const colors = ['primary', 'gold', 'violet']
const maxDiscs = 4

// Bigger bets show a taller pile; the exact amount is always printed beside it.
export default function ChipStack({ amount }) {
  const discs = Math.min(maxDiscs, Math.max(1, String(amount).length - 1))
  return <span className={styles.stack}>
    <span className={styles.pile} aria-hidden="true">{Array.from({ length: discs }, (_, index) => <i key={index} className={`${styles.disc} ${styles[colors[index % colors.length]]}`} />)}</span>
    {amount.toLocaleString()}
  </span>
}
