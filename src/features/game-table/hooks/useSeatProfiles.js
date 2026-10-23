import { useEffect, useState } from 'react'
import { fetchProfilesByIds } from '@/features/account'

// Names and avatars of the seated players. Seats keep their short account-ID label until this loads.
export function useSeatProfiles(accountIds, enabled) {
  const [profiles, setProfiles] = useState({})
  const key = accountIds.join(',')
  useEffect(() => {
    if (!enabled || !key) return
    const abort = new AbortController()
    fetchProfilesByIds(key.split(','), abort.signal)
      .then(list => setProfiles(Object.fromEntries(list.map(profile => [profile.accountId, profile]))))
      .catch(() => { /* Names are cosmetic; the account-ID label stays when profiles are unavailable. */ })
    return () => abort.abort()
  }, [key, enabled])
  return profiles
}
