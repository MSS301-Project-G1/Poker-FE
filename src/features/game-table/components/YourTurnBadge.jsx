import { useEffect } from 'react'
import { useSound } from '@/shared/audio'
import { Icon } from '@/shared/ui'
import { useCountdown } from '../hooks/useCountdown'
import styles from './YourTurnBadge.module.css'

const urgentSeconds = 5

// Sits on the board's lower edge while you must act; it pulses and warns once when time runs low.
export default function YourTurnBadge({ deadline, serverTime, receivedAt }) {
  const seconds = useCountdown({ deadline, serverTime, receivedAt })
  const urgent = seconds <= urgentSeconds
  const { play } = useSound()
  useEffect(() => { if (urgent) play('urgent') }, [urgent, play])
  return <div className={`${styles.badge} ${urgent ? styles.urgent : ''}`} role="timer" aria-label="Your turn countdown">
    <Icon name="timer" /><span>YOUR TURN ({seconds}s)</span>
  </div>
}
