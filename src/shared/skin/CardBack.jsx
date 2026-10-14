import styles from './skin.module.css'

export default function CardBack({ size = 'md' }) {
  return <div className={`${styles.card} ${styles[size]} ${styles.back}`} aria-label="Hidden card"><span>♠</span></div>
}
