import { lazy, Suspense } from 'react'
import styles from './LobbyBackdrop.module.css'

const Scene = lazy(() => import('./LobbySceneCanvas'))
export default function LobbyBackdrop() {
  return <div className={styles.backdrop} aria-hidden="true"><Suspense fallback={null}><Scene /></Suspense><div className={styles.shade} /></div>
}
