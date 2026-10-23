import styles from './skin.module.css'

/** @param {{ className?: string, glow?: boolean, ref?: import('react').Ref<HTMLDivElement>, children?: import('react').ReactNode }} props  glow: pulse the rail, e.g. on your turn. */
export default function TableTheme({ className = '', glow = false, ref, children }) {
  return <div ref={ref} className={`${styles.felt} ${className}`}>{glow && <div className={styles.railGlow} aria-hidden="true" />}{children}</div>
}
