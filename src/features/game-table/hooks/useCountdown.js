import { useEffect, useState } from 'react'

const tickMillis = 100

/** Whole seconds left until the server deadline, corrected for the clock gap between client and server. */
export function useCountdown({ deadline, serverTime, receivedAt }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), tickMillis)
    return () => window.clearInterval(interval)
  }, [])
  return Math.max(0, Math.ceil((Date.parse(deadline) - Date.parse(serverTime) - (now - receivedAt)) / 1000))
}
