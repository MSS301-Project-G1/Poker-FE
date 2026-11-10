import { useEffect, useState } from 'react'
import { useCommunity } from '@/features/community'
import { fetchRoom } from '../api/roomApi'

// Every room change sends ROOM_UPDATED or ROOM_STARTED to the members on /ws/social, which reloads the room at once.
// Polling stays as the fallback: fast while that socket is down (and for local ?devUser identities, which have
// no socket), slow while it is up.
export const POLL_MILLIS = 3000
export const LIVE_POLL_MILLIS = 15000
const ROOM_EVENTS = new Set(['ROOM_UPDATED', 'ROOM_STARTED'])

const initial = { phase: 'loading', room: null, error: '' }

export function useRoom({ code, devUser }) {
  const [state, setState] = useState(initial)
  const { notifications, connection } = useCommunity()
  const live = !devUser && connection.social === 'connected'
  // The newest notification about this room; each new one restarts the load below.
  const nudge = notifications.find(row => ROOM_EVENTS.has(row.type) && row.data?.roomCode === code)?.eventId

  useEffect(() => {
    let disposed = false
    let timer
    const abort = new AbortController()
    async function load() {
      let gone = false
      try {
        const room = await fetchRoom(code, { devUser, signal: abort.signal })
        if (!disposed) setState({ phase: 'ready', room, error: '' })
      } catch (error) {
        if (disposed || error.name === 'AbortError') return
        // 403: no longer a member (left or removed); 404: the room closed.
        gone = error.status === 403 || error.status === 404
        setState(current => gone ? { phase: 'gone', room: null, error: error.message }
          : { ...current, phase: current.room ? 'ready' : 'error', error: error.message })
      }
      if (!disposed && !gone) timer = window.setTimeout(load, live ? LIVE_POLL_MILLIS : POLL_MILLIS)
    }
    void load()
    return () => {
      disposed = true
      abort.abort()
      window.clearTimeout(timer)
    }
  }, [code, devUser, live, nudge])

  // Actions return the updated room, which replaces the polled copy immediately.
  const apply = room => setState({ phase: 'ready', room, error: '' })
  return { ...state, apply }
}
