import { useEffect, useState } from 'react'
import { useCommunity } from '../CommunityContext'
import { communityApi as api } from '../api/communityApi'

/**
 * Which of `ids` are friends right now, as a Set, or null while the first answer is loading.
 * Asks the server on every mount and whenever a friendship is accepted, so it never trusts a list
 * loaded earlier in the session.
 */
export function useFriendIds(ids) {
  const { notifications } = useCommunity()
  const [state, setState] = useState({ key: '', friends: null })
  const key = [...new Set(ids.filter(Boolean))].sort().join(',')
  const lastAccepted = notifications.find(row => row.type === 'FRIEND_ACCEPTED')?.eventId
  useEffect(() => {
    if (!key) return
    const controller = new AbortController()
    api.friendsAmong(key.split(','), controller.signal)
      .then(rows => { if (!controller.signal.aborted) setState({ key, friends: new Set(rows) }) })
      .catch(() => { if (!controller.signal.aborted) setState({ key, friends: new Set() }) })
    return () => controller.abort()
  }, [key, lastAccepted])
  return state.key === key ? state.friends : null
}
