import { useEffect, useState } from 'react'
import { fetchMatchRewards } from '../api/rewardsApi'

// Ranking applies match.finished asynchronously, so the result can be missing for a few seconds after the table ends.
export const REWARD_POLL_MILLIS = 3000
export const REWARD_POLL_ATTEMPTS = 10

export function useMatchRewards(matchId, enabled) {
  const [rewards, setRewards] = useState(null)
  useEffect(() => {
    if (!enabled || !matchId) return
    let timer
    let attempts = 0
    const abort = new AbortController()
    async function load() {
      try {
        const result = await fetchMatchRewards(matchId, abort.signal)
        setRewards({ eloDelta: result.eloDelta, coins: result.rewardCoins })
      } catch (error) {
        if (error.name === 'AbortError') return
        // After the last attempt the dialog keeps its "updates appear once processed" note.
        attempts += 1
        if (attempts < REWARD_POLL_ATTEMPTS) timer = window.setTimeout(load, REWARD_POLL_MILLIS)
      }
    }
    void load()
    return () => {
      abort.abort()
      window.clearTimeout(timer)
    }
  }, [matchId, enabled])
  return rewards
}
