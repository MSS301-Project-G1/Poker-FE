import { useEffect, useRef, useState } from 'react'
import styles from './LiveTableSurface.module.css'

export default function LiveTableSurface({ snapshot, onStatus }) {
  const canvas = useRef(null)
  const view = useRef(null)
  const latest = useRef(snapshot)
  const [entering, setEntering] = useState(false)
  useEffect(() => { latest.current = snapshot; view.current?.update(snapshot) }, [snapshot])
  useEffect(() => {
    let stopped = false
    const node = canvas.current
    const storageKey = `poker.table.entrance:${latest.current.tableId}`
    function failed() { if (!stopped) { node.dataset.renderStatus = 'unavailable'; onStatus('unavailable'); setEntering(false); view.current?.dispose(); view.current = null } }
    const lost = event => { event.preventDefault(); failed() }
    node.addEventListener('webglcontextlost', lost)
    void import('./liveTableScene').then(({ createLiveTableScene }) => {
      if (stopped) return
      let intro = true
      try { intro = sessionStorage.getItem(storageKey) !== 'seen' } catch { /* Storage is optional. */ }
      setEntering(intro && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      view.current = createLiveTableScene(node, node.closest('[data-live-table]'), intro, () => onStatus('ready'), () => {
        if (stopped) return
        setEntering(false)
        try { sessionStorage.setItem(storageKey, 'seen') } catch { /* Storage is optional. */ }
      })
      view.current.update(latest.current)
    }).catch(failed)
    return () => { stopped = true; node.removeEventListener('webglcontextlost', lost); view.current?.dispose(); view.current = null }
  }, [onStatus])
  return <div className={styles.surface}>
    <canvas ref={canvas} className={styles.canvas} aria-label="Bàn poker 3D trực tiếp" data-testid="live-table-3d" />
    {entering && <button type="button" className={styles.skip} onClick={() => view.current?.skip()}>Bỏ qua hiệu ứng</button>}
  </div>
}
