import { useEffect, useState } from 'react'
import { fetchFriendsLeaderboard } from '../api/rankingApi'

const initial = { phase: 'loading', rows: null, error: '' }

// Loads only while the friends tab is open; 401 means there is no signed-in player to compare with.
export function useFriendsLeaderboard({ enabled, devUser, getAccessToken, attempt }) {
  const [state, setState] = useState(initial)

  useEffect(() => {
    if (!enabled) return undefined
    const abort = new AbortController()
    async function load() {
      setState(current => ({ ...current, phase: current.rows ? 'refreshing' : 'loading', error: '' }))
      try {
        const rows = await fetchFriendsLeaderboard({ accessToken: await getAccessToken(), devUser, signal: abort.signal })
        setState({ phase: 'ready', rows, error: '' })
      } catch (error) {
        if (error.name === 'AbortError') return
        setState(current => ({ ...current, phase: error.status === 401 ? 'signed-out' : 'error', error: error.message }))
      }
    }
    void load()
    return () => abort.abort()
  }, [enabled, devUser, getAccessToken, attempt])

  return state
}
