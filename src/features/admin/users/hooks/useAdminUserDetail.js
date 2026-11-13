import { useEffect, useState } from 'react'
import { fetchAdminUserDetails, fetchPlayerStanding, fetchRecentMatches } from '../api/adminUserApi'

const settle = promise => promise.then(data => ({ data, error: null }), error => ({ data: null, error }))

/** Auth details decide the page; ranking and game data are extra and fail on their own. */
export function useAdminUserDetail(accountId, attempt) {
  const key = `${accountId}:${attempt}`
  const [result, setResult] = useState({ key: null })
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([fetchAdminUserDetails(accountId, controller.signal), settle(fetchPlayerStanding(accountId, controller.signal)),
      settle(fetchRecentMatches(accountId, controller.signal))])
      .then(([user, standing, matches]) => { if (!controller.signal.aborted) setResult({ key, user, standing, matches }) })
      .catch(error => { if (!controller.signal.aborted) setResult({ key, error }) })
    return () => controller.abort()
  }, [accountId, key])
  return result.key === key ? { ...result, loading: false } : { loading: true }
}
