import { useCallback, useEffect, useState } from 'react'
import { claimSeasonRewards, fetchMySeasonRewards } from '../api/seasonApi'

const initial = { phase: 'loading', items: [], error: '' }

// Rewards of ended seasons; claim() replaces the claimed season with the server's answer.
export function useMySeasonRewards({ devUser, getAccessToken, attempt }) {
  const [state, setState] = useState(initial)

  useEffect(() => {
    const abort = new AbortController()
    async function load() {
      setState(current => ({ ...current, phase: 'loading', error: '' }))
      try {
        const items = await fetchMySeasonRewards({ accessToken: await getAccessToken(), devUser, signal: abort.signal })
        setState({ phase: 'ready', items, error: '' })
      } catch (error) {
        if (error.name === 'AbortError') return
        setState({ ...initial, phase: error.status === 401 ? 'signed-out' : 'error', error: error.message })
      }
    }
    void load()
    return () => abort.abort()
  }, [devUser, getAccessToken, attempt])

  const claim = useCallback(async seasonId => {
    const claimed = await claimSeasonRewards(seasonId, { accessToken: await getAccessToken(), devUser })
    setState(current => ({ ...current, items: current.items.map(item => item.seasonId === seasonId ? claimed : item) }))
    return claimed
  }, [devUser, getAccessToken])

  return { ...state, claim }
}
