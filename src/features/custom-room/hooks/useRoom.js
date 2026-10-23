import { useEffect, useState } from 'react'
import { fetchRoom } from '../api/roomApi'

// Polling stands in for ROOM_UPDATED on /ws/social until the notification socket exists.
export const POLL_MILLIS = 3000

const initial = { phase: 'loading', room: null, error: '' }

export function useRoom({ code, devUser }) {
  const [state, setState] = useState(initial)

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
      if (!disposed && !gone) timer = window.setTimeout(load, POLL_MILLIS)
    }
    void load()
    return () => {
      disposed = true
      abort.abort()
      window.clearTimeout(timer)
    }
  }, [code, devUser])

  // Actions return the updated room, which replaces the polled copy immediately.
  const apply = room => setState({ phase: 'ready', room, error: '' })
  return { ...state, apply }
}
