import styles from './FloatingPanel.module.css'

/**
 * Wraps a lobby panel so it floats around the 3D table (desktop only).
 * @param {{ side: 'left' | 'right' | 'bottom', className?: string }} props
 */
export default function FloatingPanel({ side, className = '', children }) {
  return <div className={`${styles.panel} ${styles[side]} ${className}`}>
    <div className={styles.surface}>{children}</div>
  </div>
}

/**
 * A side column of floating panels. The whole column leans as one sheet, so its panels stay aligned.
 * @param {{ side: 'left' | 'right', as?: 'div' | 'aside', className?: string }} props
 */
export function FloatingColumn({ side, as: Tag = 'div', className = '', children }) {
  return <Tag className={`${styles.column} ${styles[side]} ${className}`}>{children}</Tag>
}
