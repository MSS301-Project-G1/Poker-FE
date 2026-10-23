import styles from './skin.module.css'

/** @param {{ className?: string, glow?: boolean, ref?: import('react').Ref<HTMLDivElement>, children?: import('react').ReactNode }} props  glow: pulse the rail, e.g. on your turn. */
export default function TableTheme({ className = '', glow = false, spatial = false, ref, children, ...props }) {
  return <div ref={ref} className={`${styles.felt} ${spatial ? styles.spatial : ''} ${className}`} {...props}>{glow && !spatial && <div className={styles.railGlow} aria-hidden="true" />}{children}</div>
}
