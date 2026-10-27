import { useEffect, useState } from 'react'

// The current time, refreshed every intervalMillis so countdowns move without a reload.
export function useNow(intervalMillis) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMillis)
    return () => window.clearInterval(timer)
  }, [intervalMillis])
  return now
}
