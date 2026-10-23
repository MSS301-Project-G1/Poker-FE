import { useEffect, useState } from 'react'
import { fetchTournaments } from '../api/adminTournamentApi'

export const PAGE_SIZE = 20

const initial = { phase: 'loading', result: null, error: '' }

// One page of scheduled and running (past=false) or ended tournaments; attempt reloads after a change.
export function useAdminTournaments({ past, page, devUser, attempt }) {
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
