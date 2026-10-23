import styles from './skin.module.css'

/** @param {{ size?: string, decorative?: boolean }} props  decorative: the hidden side of a card that is turning over. */
export default function CardBack({ size = 'md', decorative = false }) {
  return <div className={`${styles.card} ${styles[size]} ${styles.back}`} {...decorative ? { 'aria-hidden': true } : { 'aria-label': 'Hidden card' }}><span>♠</span></div>
}
