import { useEffect, useState } from 'react'
import { fetchProfilesByIds } from '@/features/account'

// The profile batch endpoint answers at most 100 ids per call.
const BATCH = 100

// Names and avatars of the listed players. Rows keep their short account-ID label until this loads.
export function useProfiles(accountIds) {
  const [profiles, setProfiles] = useState({})
  const key = [...new Set(accountIds.filter(Boolean))].join(',')
  useEffect(() => {
    if (!key) return
    const abort = new AbortController()
    const ids = key.split(',')
    const batches = Array.from({ length: Math.ceil(ids.length / BATCH) }, (_, index) => ids.slice(index * BATCH, (index + 1) * BATCH))
    Promise.all(batches.map(batch => fetchProfilesByIds(batch, abort.signal)))
      .then(lists => setProfiles(Object.fromEntries(lists.flat().map(profile => [profile.accountId, profile]))))
      .catch(() => { /* Names are cosmetic; the account-ID label stays when profiles are unavailable. */ })
    return () => abort.abort()
  }, [key])
  return profiles
}
