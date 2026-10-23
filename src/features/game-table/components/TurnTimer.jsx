import { Icon } from '@/shared/ui'
import { useCountdown } from '../hooks/useCountdown'
import styles from './TurnTimer.module.css'

export default function TurnTimer({ deadline, serverTime, receivedAt, paused, label = paused ? 'VÁN TIẾP THEO' : 'LƯỢT HIỆN TẠI' }) {
  const seconds = useCountdown({ deadline, serverTime, receivedAt })
  return <div className={`${styles.timer} ${seconds <= 5 ? styles.urgent : ''}`} role="timer" aria-label={paused ? 'Next hand countdown' : 'Turn countdown'}>
    <Icon name="timer" /><strong>{seconds}s</strong><span>{label}</span>
  </div>
}
