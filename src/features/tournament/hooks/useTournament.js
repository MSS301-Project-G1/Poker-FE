import { useEffect, useState } from 'react'
import { useCommunity } from '@/features/community'
import { fetchTournament } from '../api/tournamentApi'

// Polling keeps the bracket and the field current for everyone watching. Seated players also get
// TOURNAMENT_TABLE_READY (and invitees TOURNAMENT_INVITE) on /ws/social, which reloads at once instead of
// waiting for the next poll.
export const POLL_MILLIS = 5000
const TOURNAMENT_EVENTS = new Set(['TOURNAMENT_TABLE_READY', 'TOURNAMENT_INVITE'])

const ENDED = new Set(['FINISHED', 'CANCELLED'])
const initial = { phase: 'loading', tournament: null, error: '' }

export function useTournament({ id, devUser }) {
  const [state, setState] = useState(initial)
  const { notifications } = useCommunity()
  // The newest notification about this tournament; each new one restarts the load below.
  const nudge = notifications.find(row => TOURNAMENT_EVENTS.has(row.type) && row.data?.tournamentId === id)?.eventId

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
  }, [id, devUser, nudge])

  // Register and confirm return the updated tournament, which replaces the polled copy immediately.
  const apply = tournament => setState({ phase: 'ready', tournament, error: '' })
  return { ...state, apply }
}
