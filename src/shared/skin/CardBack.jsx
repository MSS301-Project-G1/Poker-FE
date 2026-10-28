import CardImage from './CardImage'
import { useSkin } from './SkinContext'
import styles from './skin.module.css'

/** @param {{ size?: string, decorative?: boolean }} props  decorative: the hidden side of a card that is turning over. */
export default function CardBack({ size = 'md', decorative = false }) {
  const { cardBack } = useSkin()
  const className = `${styles.card} ${styles[size]} ${styles.back}`
  const defaultBack = <div className={className} {...decorative ? { 'aria-hidden': true } : { 'aria-label': 'Hidden card' }}><span>♠</span></div>
  return cardBack ? <CardImage src={cardBack} className={className} label="Hidden card" decorative={decorative}>{defaultBack}</CardImage> : defaultBack
}
