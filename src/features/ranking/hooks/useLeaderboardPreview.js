import { useEffect, useState } from 'react'
import { devIdentity } from '@/shared/lib/devIdentity'
import { fetchCurrentSeason, fetchLeaderboard, fetchMyStanding } from '../api/rankingApi'
import { useProfiles } from './useProfiles'

const initial = { phase: 'loading', season: null, top: [], me: null, error: '' }

/**
 * The top of the season leaderboard and the player's own standing, for screens outside /ranking such as the
 * lobby. The top still shows when the own standing cannot be read.
 */
export function useLeaderboardPreview(size) {
  const devUser = devIdentity()
  const [state, setState] = useState(initial)

  useEffect(() => {
    const abort = new AbortController()
    const identity = { devUser, signal: abort.signal }
    const standing = fetchMyStanding(identity).catch(error => {
      if (error.name === 'AbortError') throw error
      return null
    })
    Promise.all([fetchCurrentSeason(identity), fetchLeaderboard(0, size, identity), standing])
      .then(([season, board, me]) => setState({ phase: board.content.length ? 'ready' : 'empty', season, top: board.content, me, error: '' }))
      .catch(error => { if (error.name !== 'AbortError') setState({ ...initial, phase: 'error', error: error.message }) })
    return () => abort.abort()
  }, [devUser, size])

  const profiles = useProfiles(state.top.map(player => player.accountId))
  return { ...state, profiles }
}
