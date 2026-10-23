import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { useQueue } from '@/features/ranked'
import { useSound } from '@/shared/audio/SoundContext'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'
import styles from './SoloTestButton.module.css'

export default function SoloTestButton({ className }) {
  const navigate = useNavigate()
  const { activeMode, pending } = useQueue()
  const { play } = useSound()
  const [deadline, setDeadline] = useState(null)
  const [seconds, setSeconds] = useState(10)

  useEffect(() => {
    if (deadline === null) return
    function tick() {
      if (activeMode || pending) { setDeadline(null); return }
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setSeconds(left)
      if (left === 0) {
        play('match')
        navigate(paths.demo)
      }
    }
    const timer = window.setInterval(tick, 100)
    function keyboard(event) { if (event.key === 'Escape') setDeadline(null) }
    document.addEventListener('keydown', keyboard)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('keydown', keyboard)
    }
  }, [deadline, navigate, play, activeMode, pending])

  return <>
    <button type="button" className={className} disabled={Boolean(activeMode || pending || deadline)} onClick={() => {
      setSeconds(10)
      setDeadline(Date.now() + 10000)
      play('shuffle')
    }}><Icon name="smart_toy" />Test 1 người · 10 giây</button>
    {deadline !== null && createPortal(<section className={styles.card} role="dialog" aria-modal="false" aria-labelledby="solo-test-title" data-testid="solo-test-countdown">
      <span className={styles.badge}>CHƠI THỬ VỚI BOT</span>
      <h2 id="solo-test-title">Đang chuẩn bị bàn chơi</h2>
      <p>1 người chơi + 5 bot · Xu mô phỏng</p>
      <p className={styles.countdown} role="status">Vào trận sau <strong>{seconds}</strong> giây</p>
      <button type="button" onClick={() => setDeadline(null)}>Hủy chơi thử</button>
    </section>, document.body)}
  </>
}
