import { useEffect, useState } from 'react'
import { devIdentity } from '@/shared/lib/devIdentity'
import { fetchTournaments } from '../api/tournamentApi'

// Enough of the upcoming list (soonest first) to find one that still takes players.
const LOOK_AHEAD = 5
const initial = { phase: 'loading', tournament: null, error: '' }

/**
 * The tournament to feature on screens outside /tournaments such as the lobby: the soonest one still scheduled,
 * else the soonest one being played. phase is 'empty' when nothing is upcoming.
 */
export function useNextTournament() {
  const devUser = devIdentity()
  const [state, setState] = useState(initial)

  useEffect(() => {
    const abort = new AbortController()
    fetchTournaments(false, 0, LOOK_AHEAD, { devUser, signal: abort.signal })
      .then(({ content }) => {
        const tournament = content.find(row => row.status === 'SCHEDULED') || content[0] || null
        setState({ phase: tournament ? 'ready' : 'empty', tournament, error: '' })
      })
      .catch(error => { if (error.name !== 'AbortError') setState({ ...initial, phase: 'error', error: error.message }) })
    return () => abort.abort()
  }, [devUser])

  return state
}
