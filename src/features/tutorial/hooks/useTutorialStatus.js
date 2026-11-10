import { useEffect, useState } from 'react'
import { fetchTutorial } from '../api/tutorialApi'

// Whether the reward is still to be earned. The tutorial plays without it, so a failure only hides the coin line.
export function useTutorialStatus(devUser) {
  const [status, setStatus] = useState(null)
  useEffect(() => {
    const abort = new AbortController()
    fetchTutorial({ devUser, signal: abort.signal })
      .then(setStatus)
      .catch(() => { /* The coin line stays hidden; completing still works. */ })
    return () => abort.abort()
  }, [devUser])
  return [status, setStatus]
}
