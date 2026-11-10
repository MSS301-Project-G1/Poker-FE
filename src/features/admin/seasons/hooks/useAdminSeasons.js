import { useEffect, useState } from 'react'
import { fetchSeasons } from '../api/adminSeasonApi'

const initial = { phase: 'loading', seasons: [], error: '' }

// Every season with its rewards; attempt reloads after a change or a failed load.
export function useAdminSeasons({ devUser, attempt }) {
  const [state, setState] = useState(initial)

  useEffect(() => {
    const abort = new AbortController()
    async function load() {
      setState(current => ({ ...current, phase: current.seasons.length ? 'refreshing' : 'loading', error: '' }))
      try {
        const seasons = await fetchSeasons({ devUser, signal: abort.signal })
        setState({ phase: 'ready', seasons, error: '' })
      } catch (error) {
        if (error.name !== 'AbortError') setState(current => ({ ...current, phase: 'error', error: error.message }))
      }
    }
    void load()
    return () => abort.abort()
  }, [devUser, attempt])

  return state
}
