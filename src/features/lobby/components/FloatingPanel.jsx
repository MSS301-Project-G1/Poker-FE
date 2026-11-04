import styles from './FloatingPanel.module.css'

/**
 * Wraps a lobby panel so it floats around the 3D table (desktop only).
 * @param {{ side: 'left' | 'right' | 'bottom', arc?: boolean, className?: string }} props
 */
export default function FloatingPanel({ side, arc = false, className = '', children }) {
  return <div className={`${styles.panel} ${styles[side]} ${arc ? styles.arc : ''} ${className}`}>
    <div className={styles.surface}>{children}</div>
  </div>
}
