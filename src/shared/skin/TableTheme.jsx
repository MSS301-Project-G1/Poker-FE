import { useSkin } from './SkinContext'
import styles from './skin.module.css'

/** @param {{ className?: string, glow?: boolean, ref?: import('react').Ref<HTMLDivElement>, children?: import('react').ReactNode }} props  glow: pulse the rail, e.g. on your turn. */
export default function TableTheme({ className = '', glow = false, spatial = false, ref, style, children, ...props }) {
  const { felt, dealer } = useSkin()
  const feltStyle = felt ? { ...style, '--felt-image': `url("${felt}")` } : style
  // An equipped dealer replaces the club name printed on the felt.
  return <div ref={ref} className={`${styles.felt} ${spatial ? styles.spatial : ''} ${dealer?.idle ? styles.withDealer : ''} ${className}`} style={feltStyle} {...props}>{glow && !spatial && <div className={styles.railGlow} aria-hidden="true" />}{children}</div>
}
