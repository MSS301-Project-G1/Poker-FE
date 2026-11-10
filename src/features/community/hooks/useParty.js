import { useCallback } from 'react'
import { communityApi } from '../api/communityApi'
import { useResource } from './useResource'

export function useParty(enabled = true) {
  const loader = useCallback(signal => enabled ? communityApi.party(signal) : Promise.resolve(null), [enabled])
  return useResource(loader, enabled ? 3000 : 0)
}
