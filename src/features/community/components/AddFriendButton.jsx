import { useState } from 'react'
import { Icon } from '@/shared/ui'
import { useCommunity } from '../CommunityContext'
import { useFriendIds } from '../hooks/useFriendIds'

const HTTP_CONFLICT = 409
const labels = { loading: 'Checking…', friend: 'Friends', none: 'Add friend', busy: 'Sending…', sent: 'Request sent', error: 'Try again' }
const icons = { none: 'person_add', busy: 'hourglass_top', sent: 'schedule', error: 'refresh' }

/**
 * Add-friend action that follows the real relation. `isFriend` comes from useFriendIds (null while loading).
 * Sending to someone who already invited us accepts their request, and "already friends" (409) only means
 * this view was stale, so both end as Friends. `compact` is icon-only and disappears for friends.
 */
export default function AddFriendButton({ accountId, isFriend, compact = false, className = '' }) {
  const { sendFriendRequest } = useCommunity()
  const [result, setResult] = useState(null)
  const state = isFriend || result === 'friend' ? 'friend' : result || (isFriend === null ? 'loading' : 'none')
  const disabled = !['none', 'error'].includes(state)

  async function add() {
    setResult('busy')
    try {
      const request = await sendFriendRequest(accountId)
      setResult(request?.status === 'ACCEPTED' ? 'friend' : 'sent')
    } catch (error) {
      setResult(error.status === HTTP_CONFLICT ? 'friend' : 'error')
    }
  }

  if (compact) return ['friend', 'loading'].includes(state) ? null
    : <button type="button" className={className} disabled={disabled} onClick={() => void add()} aria-label={labels[state]} title={labels[state]}><Icon name={icons[state]} /></button>
  return <button type="button" className={className} disabled={disabled} onClick={() => void add()}>{labels[state]}</button>
}

/** Asks the server about this one player when it mounts, so a popover opened later is never stale. */
export function FriendCheckButton({ accountId, className }) {
  const friends = useFriendIds([accountId])
  return <AddFriendButton accountId={accountId} isFriend={friends && friends.has(accountId)} className={className} />
}
