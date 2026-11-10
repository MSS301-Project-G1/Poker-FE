import { useState } from 'react'
import styles from './skin.module.css'

/** An equipped card image. If it cannot load (e.g. an expired link), the default card passed as children shows. */
export default function CardImage({ src, className, label, decorative = false, children }) {
  const [failedSrc, setFailedSrc] = useState(null)
  if (failedSrc === src) return children
  return <div className={`${className} ${styles.skinned}`} {...decorative ? { 'aria-hidden': true } : { 'aria-label': label }}>
    <img src={src} alt="" draggable={false} onError={() => setFailedSrc(src)} />
  </div>
}
