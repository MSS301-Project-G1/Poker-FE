import { useEffect } from 'react'
import { FriendCheckButton, useCommunity, usePopover } from '@/features/community'
import { Icon } from '@/shared/ui'
import styles from '../RankedPage.module.css'

export default function QueueRoster({ queue, user, max, count }) {
  const { profiles, loadProfiles } = useCommunity()
  const popover = usePopover()
  const ids = Array.isArray(queue?.playerIds) ? [...new Set(queue.playerIds)].slice(0, max) : []
  const idsKey = ids.join(',')
  const partyRoom = queue?.status === 'PARTY'
  useEffect(() => {
    if (idsKey) void loadProfiles(idsKey.split(','))
  }, [idsKey, loadProfiles])

  return <div className={styles.seats} style={{ '--seats': max }}>
    {Array.from({ length: max }, (_, index) => {
      const id = ids[index]
      const occupied = Boolean(id) || index < count
      const you = id === user?.accountId
      const profile = you ? user?.profile : profiles[id]
      const preparing = ['PARTY', 'PREPARING'].includes(queue?.status)
      const name = you ? `${profile?.displayName || 'You'} (You)` : profile?.displayName || (id ? `Player ${id.slice(0, 6)}` : occupied ? 'Loading players…' : preparing ? 'Open seat' : 'Finding…')
      const open = partyRoom && Boolean(id) && popover.openId === id
      const avatar = <img src={profile?.avatarUrl || '/stitch-assets/avatar.svg'} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/stitch-assets/avatar.svg' }} />
      return <div className={`${styles.seat} ${occupied ? styles.filled : ''}`} key={id || `empty-${index}`} ref={open ? popover.ref : undefined} data-testid="queue-player" data-account-id={id || ''}>
        {occupied ? partyRoom && id && !you ? <button type="button" className={styles.seatAvatarButton} onClick={() => popover.toggle(id)} aria-label={`View ${name}`} aria-expanded={open}>{avatar}</button> : avatar : <span className={styles.avatar}><Icon name="hourglass_top" /></span>}
        {open && <div className={styles.seatPopover}><strong>{name}</strong><FriendCheckButton accountId={id} /></div>}
        <strong title={name}>{name}</strong><span className="short:hidden">{queue?.status === 'PARTY' ? id === queue.leaderId ? 'Leader' : occupied ? 'Member' : 'Invite friends to the party' : queue?.status === 'PROPOSED' ? 'In match proposal' : `Seat #${String(index + 1).padStart(2, '0')}`}</span><small>{preparing ? occupied ? 'Ready' : 'Waiting' : occupied ? 'In queue' : 'Matching'}</small>
      </div>
    })}
  </div>
}
