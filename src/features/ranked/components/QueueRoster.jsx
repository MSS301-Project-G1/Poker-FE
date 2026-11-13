import { useEffect, useState } from 'react'
import { useCommunity } from '@/features/community'
import { Icon } from '@/shared/ui'
import styles from '../RankedPage.module.css'
import { communityApi } from '@/features/community/api/communityApi'

export default function QueueRoster({ queue, user, max, count }) {
  const { profiles, loadProfiles, sendFriendRequest } = useCommunity()
  const [selectedId, setSelectedId] = useState(null)
  const [friendStatus, setFriendStatus] = useState({})
  const [friendIds, setFriendIds] = useState(() => new Set())
  const ids = Array.isArray(queue?.playerIds) ? [...new Set(queue.playerIds)].slice(0, max) : []
  const idsKey = ids.join(',')
  useEffect(() => {
    if (idsKey) void loadProfiles(idsKey.split(','))
  }, [idsKey, loadProfiles])
  useEffect(() => { let alive = true; communityApi.friends(0).then(result => { if (alive) setFriendIds(new Set((result?.items || []).map(row => row.accountId || row.id || row))) }).catch(() => {}); return () => { alive = false } }, [])
  async function showProfile(id) {
    if (queue?.status !== 'PARTY' || !id || id === user?.accountId) return
    setSelectedId(id)
  }

  return <div className={styles.seats} style={{ '--seats': max }}>
    {Array.from({ length: max }, (_, index) => {
      const id = ids[index]
      const occupied = Boolean(id) || index < count
      const you = id === user?.accountId
      const profile = you ? user?.profile : profiles[id]
      const preparing = ['PARTY', 'PREPARING'].includes(queue?.status)
      const name = you ? `${profile?.displayName || 'You'} (You)` : profile?.displayName || (id ? `Player ${id.slice(0, 6)}` : occupied ? 'Loading players…' : preparing ? 'Open seat' : 'Finding…')
      return <div className={`${styles.seat} ${occupied ? styles.filled : ''}`} key={id || `empty-${index}`} data-testid="queue-player" data-account-id={id || ''}>
        {occupied ? queue?.status === 'PARTY' ? <button type="button" className={styles.seatAvatarButton} onClick={() => showProfile(id)} aria-label={`View ${name}`}><img src={profile?.avatarUrl || '/stitch-assets/avatar.svg'} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/stitch-assets/avatar.svg' }} /></button> : <img src={profile?.avatarUrl || '/stitch-assets/avatar.svg'} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/stitch-assets/avatar.svg' }} /> : <span className={styles.avatar}><Icon name="hourglass_top" /></span>}
        {selectedId === id && <div className={styles.seatPopover}><strong>{name}</strong><button type="button" disabled={friendIds.has(id) || friendStatus[id] === 'sent' || friendStatus[id] === 'busy'} onClick={async () => { setFriendStatus(current => ({ ...current, [id]: 'busy' })); try { await sendFriendRequest(id); setFriendStatus(current => ({ ...current, [id]: 'sent' })) } catch { setFriendStatus(current => ({ ...current, [id]: 'error' })) } }}>{friendIds.has(id) ? 'Friends' : friendStatus[id] === 'sent' ? 'Request sent' : friendStatus[id] === 'error' ? 'Try again' : 'Add friend'}</button></div>}
        <strong title={name}>{name}</strong><span className="short:hidden">{queue?.status === 'PARTY' ? id === queue.leaderId ? 'Leader' : occupied ? 'Member' : 'Invite friends to the party' : queue?.status === 'PROPOSED' ? 'In match proposal' : `Seat #${String(index + 1).padStart(2, '0')}`}</span><small>{preparing ? occupied ? 'Ready' : 'Waiting' : occupied ? 'In queue' : 'Matching'}</small>
      </div>
    })}
  </div>
}
