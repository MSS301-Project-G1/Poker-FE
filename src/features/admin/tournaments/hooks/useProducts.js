import { useEffect, useState } from 'react'
import { fetchProducts } from '../api/adminTournamentApi'

// Shop products for the champion skin picker. Without them the picker falls back to typing a product id.
export function useProducts(devUser) {
  const [state, setState] = useState({ phase: 'loading', items: [] })
  useEffect(() => {
    const abort = new AbortController()
    fetchProducts({ devUser, signal: abort.signal })
      .then(items => setState({ phase: 'ready', items }))
      .catch(error => { if (error.name !== 'AbortError') setState({ phase: 'error', items: [] }) })
    return () => abort.abort()
  }, [devUser])
  return state
}
