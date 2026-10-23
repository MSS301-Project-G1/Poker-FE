import { useState } from 'react'
import { Link } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon, useConfirm } from '@/shared/ui'
import styles from './DemoPage.module.css'

export default function DemoPage() {
  const [round, setRound] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const confirm = useConfirm()
  async function reset() {
    if (!await confirm({
      title: 'Chơi lại từ đầu?', message: 'Ván chơi thử hiện tại sẽ kết thúc và xu mô phỏng được đặt lại.',
      confirmLabel: 'Chơi lại', icon: 'restart_alt',
    })) return
    try { localStorage.removeItem('poker-rank:solo-demo:profile:v1') } catch { /* The engine also supports memory-only profiles. */ }
    setLoaded(false)
    setRound(value => value + 1)
  }
  return <main className={styles.page}>
    <header className={styles.header}><div className={styles.label}><Icon name="smart_toy" /><div><h1>Chơi thử với bot</h1><p>1 người + 5 bot · Xu mô phỏng · Không cần đăng nhập</p></div></div><nav className={styles.actions} aria-label="Điều khiển bản chơi thử"><button type="button" onClick={reset}>Chơi lại</button><Link to={paths.auth}>Về đăng nhập</Link></nav></header>
    {!loaded && <p className={styles.loading} role="status">Đang chuẩn bị bàn poker 3D…</p>}
    <iframe key={round} className={styles.frame} title="Bàn poker chơi thử một người với bot" src={`/demo/poker.html?solo=1&round=${round}`} allow="autoplay; fullscreen" onLoad={event => { setLoaded(true); event.currentTarget.contentWindow?.focus() }} />
  </main>
}
