import { useEffect, useState } from 'react'

export default function TurnTimer({ deadline, serverTime, receivedAt, paused }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(interval)
  }, [])
  const seconds = Math.max(0, Math.ceil((Date.parse(deadline) - Date.parse(serverTime) - (now - receivedAt)) / 1000))
  return <div className={`game-timer ${seconds <= 5 ? 'game-timer-urgent' : ''}`} role="timer" aria-label={paused ? 'Next hand countdown' : 'Turn countdown'}>
    <span className="material-symbols-outlined">timer</span><strong>{seconds}s</strong><span>{paused ? 'NEXT HAND' : 'TO ACT'}</span>
  </div>
}
