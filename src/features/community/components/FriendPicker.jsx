import { useCallback, useEffect, useState } from 'react'
import { useCommunity } from '../CommunityContext'
import { communityApi as api } from '../api/communityApi'
import { useResource } from '../hooks/useResource'
import { Avatar, Empty, ErrorNotice, Name } from './CommunityUI'
import styles from '../Community.module.css'

const MATCH_STATUS_REFRESH_MS = 10_000
const labels = { busy: 'Sending…', sent: 'Invited', error: 'Try again' }

/**
 * Pick friends to invite, a page at a time. `onPick(accountId)` does the actual invite and may throw.
 * Friends in `joinedIds` are already here; friends seated at a running table show "In a match" and
 * can't be invited until the status (refreshed every few seconds) says they are free.
 */
export default function FriendPicker({ joinedIds = [], onPick, disabled = false }) {
  const { loadProfiles } = useCommunity()
  const [page, setPage] = useState(0)
  const [sent, setSent] = useState({})
  const [failure, setFailure] = useState('')
  const loader = useCallback(signal => api.friends(page, signal), [page])
  const { data, loading, error, reload } = useResource(loader)
  const friends = data?.items || []
  const friendKey = friends.join(',')
  const matchLoader = useCallback(signal => friendKey ? api.playersInMatch(friendKey.split(','), signal) : Promise.resolve([]), [friendKey])
  const matches = useResource(matchLoader, MATCH_STATUS_REFRESH_MS)
  const playing = new Set(matches.data || [])
  useEffect(() => { if (friendKey) void loadProfiles(friendKey.split(',')) }, [friendKey, loadProfiles])

  async function pick(accountId) {
    setFailure('')
    setSent(current => ({ ...current, [accountId]: 'busy' }))
    try {
      await onPick(accountId)
      setSent(current => ({ ...current, [accountId]: 'sent' }))
    } catch (failure) {
      setSent(current => ({ ...current, [accountId]: 'error' }))
      setFailure(failure.message)
    }
  }

  if (loading) return <Empty>Loading friends…</Empty>
  return <div>
    <ErrorNotice message={error || failure} retry={error ? reload : null} />
    {!error && !friends.length && <Empty>No friends yet. Add players from the leaderboard or Friends &amp; party.</Empty>}
    {friends.length > 0 && <ul className={styles.list}>{friends.map(accountId => {
      const joined = joinedIds.includes(accountId)
      const inMatch = playing.has(accountId)
      const state = sent[accountId]
      return <li className={styles.row} key={accountId}>
        <Avatar id={accountId} size="small" />
        <span className={styles.person}><strong><Name id={accountId} /></strong>{inMatch && !joined && <small className={styles.muted}>In a match</small>}</span>
        <button type="button" className={styles.link}
          disabled={disabled || joined || inMatch || matches.loading || ['busy', 'sent'].includes(state)}
          onClick={() => void pick(accountId)}>{joined ? 'Joined' : inMatch ? 'In match' : labels[state] || 'Invite'}</button>
      </li>
    })}</ul>}
    {data?.totalPages > 1 && <div className="flex justify-between">
      <button type="button" className={styles.link} disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
      <button type="button" className={styles.link} disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button>
    </div>}
  </div>
}
