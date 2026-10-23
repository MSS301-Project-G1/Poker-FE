import { useEffect, useState } from 'react'
import { fetchTournament } from '../api/tournamentApi'

// Polling stands in for TOURNAMENT_TABLE_READY on /ws/social until the notification socket exists.
export const POLL_MILLIS = 5000

const ENDED = new Set(['FINISHED', 'CANCELLED'])
const initial = { phase: 'loading', tournament: null, error: '' }

export function useTournament({ id, devUser }) {
  const [state, setState] = useState(initial)

  useEffect(() => {
    let disposed = false
    let timer
    const abort = new AbortController()
    async function load() {
      let done = false
      try {
        const tournament = await fetchTournament(id, { devUser, signal: abort.signal })
        if (disposed) return
        setState({ phase: 'ready', tournament, error: '' })
        done = ENDED.has(tournament.status)
      } catch (error) {
        if (disposed || error.name === 'AbortError') return
        // 400: not a tournament id; 404: no such tournament.
        done = error.status === 400 || error.status === 404
        setState(current => done ? { phase: 'missing', tournament: null, error: error.message }
          : { ...current, phase: current.tournament ? 'ready' : 'error', error: error.message })
      }
      if (!disposed && !done) timer = window.setTimeout(load, POLL_MILLIS)
    }
    void load()
    return () => {
      disposed = true
      abort.abort()
      window.clearTimeout(timer)
    }
  }, [id, devUser])

  // Register and confirm return the updated tournament, which replaces the polled copy immediately.
  const apply = tournament => setState({ phase: 'ready', tournament, error: '' })
  return { ...state, apply }
}
