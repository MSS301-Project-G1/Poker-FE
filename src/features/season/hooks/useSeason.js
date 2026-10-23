import { useEffect, useState } from 'react'
import { fetchCurrentSeason, fetchMyStanding, fetchTierRewards } from '../api/seasonApi'

const DAY = 24 * 60 * 60 * 1000
const initial = { phase: 'loading', season: null, rewards: [], me: null, daysLeft: null, error: '' }

// Active season, its tier rewards and the player's tier. Without a signed-in player `me` stays null.
export function useSeason({ devUser, getAccessToken, attempt }) {
  const [state, setState] = useState(initial)

  useEffect(() => {
    const abort = new AbortController()
    async function load() {
      setState(current => ({ ...current, phase: 'loading', error: '' }))
      try {
        const identity = { accessToken: await getAccessToken(), devUser, signal: abort.signal }
        const season = await fetchCurrentSeason(identity)
        const [rewards, me] = await Promise.all([
          fetchTierRewards(season.id, identity),
          fetchMyStanding(identity).catch(error => {
            if (error.name === 'AbortError') throw error
            return null
          }),
        ])
        const daysLeft = Math.max(0, Math.ceil((Date.parse(season.endAt) - Date.now()) / DAY))
        setState({ phase: 'ready', season, rewards, me, daysLeft, error: '' })
      } catch (error) {
        if (error.name === 'AbortError') return
        // 404: no season is running yet.
        setState({ ...initial, phase: error.status === 404 ? 'none' : 'error', error: error.message })
      }
    }
    void load()
    return () => abort.abort()
  }, [devUser, getAccessToken, attempt])

  return state
}
