import { useEffect, useState } from 'react'
import { fetchCurrentSeason, fetchLeaderboard, fetchMyStanding } from '../api/rankingApi'

export const PAGE_SIZE = 20

const DAY = 24 * 60 * 60 * 1000
const initial = { phase: 'loading', season: null, daysLeft: null, board: null, me: null, error: '' }

// Season, leaderboard page and own standing load together; own standing needs an identity.
export function useLeaderboard({ page, devUser, getAccessToken, attempt }) {
  const [state, setState] = useState(initial)

  useEffect(() => {
    const abort = new AbortController()
    async function load() {
      setState(current => ({ ...current, phase: current.board ? 'refreshing' : 'loading', error: '' }))
      try {
        const accessToken = await getAccessToken()
        const identity = { accessToken, devUser, signal: abort.signal }
        const [season, board, me] = await Promise.all([
          fetchCurrentSeason(identity),
          fetchLeaderboard(page, PAGE_SIZE, identity),
          accessToken || devUser ? fetchMyStanding(identity) : Promise.resolve(null),
        ])
        const daysLeft = Math.max(0, Math.ceil((Date.parse(season.endAt) - Date.now()) / DAY))
        setState({ phase: board.totalElements ? 'ready' : 'empty', season, daysLeft, board, me, error: '' })
      } catch (error) {
        if (error.name !== 'AbortError') setState(current => ({ ...current, phase: 'error', error: error.message }))
      }
    }
    void load()
    return () => abort.abort()
  }, [page, devUser, getAccessToken, attempt])

  return state
}
