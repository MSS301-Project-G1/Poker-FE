import { useEffect, useState } from 'react'
import { fetchTournaments } from '../api/tournamentApi'

export const PAGE_SIZE = 12

const initial = { phase: 'loading', result: null, error: '' }

// One page of upcoming (soonest first) or past (latest first) tournaments.
export function useTournaments({ past, page, devUser, attempt }) {
  const [state, setState] = useState(initial)

  useEffect(() => {
    const abort = new AbortController()
    async function load() {
      setState(current => ({ ...current, phase: current.result ? 'refreshing' : 'loading', error: '' }))
      try {
        const result = await fetchTournaments(past, page, PAGE_SIZE, { devUser, signal: abort.signal })
        setState({ phase: result.totalElements ? 'ready' : 'empty', result, error: '' })
      } catch (error) {
        if (error.name !== 'AbortError') setState(current => ({ ...current, phase: 'error', error: error.message }))
      }
    }
    void load()
    return () => abort.abort()
  }, [past, page, devUser, attempt])

  return state
}
