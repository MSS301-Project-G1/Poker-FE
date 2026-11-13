import { Icon } from '@/shared/ui'
import { useCommunity } from '../CommunityContext'
import { Empty } from './CommunityUI'
import styles from '../Community.module.css'
import { communityApi as api } from '../api/communityApi'
import { useState } from 'react'

export default function NotificationsPanel() {
  const { notifications, connection, setPanel } = useCommunity()
  const [busy, setBusy] = useState(null)
  async function respond(row, action) { if (busy) return; setBusy(row.eventId); try { if (action === 'accept') await api.acceptPartyInvite(row.data.invitationId); else await api.declinePartyInvite(row.data.invitationId) } finally { setBusy(null) } }
  return <div className={styles.stack}>
    <p className={styles.hint}><Icon name={connection.social === 'connected' ? 'wifi' : 'wifi_off'} />{connection.social === 'connected' ? 'Live notifications connected.' : 'Reconnecting notifications.'}</p>
    <p className={styles.muted}>Notifications from this session. Server-side history isn’t supported yet.</p>
    {!notifications.length ? <Empty icon="notifications_none">No new notifications this session.</Empty> : <ul className={styles.list}>{notifications.map(row => <li key={row.eventId} className={styles.socialRow}><strong>{row.title}</strong><p className={styles.muted}>{row.body}</p><small className={styles.muted}>{new Date(row.occurredAt).toLocaleString('en-US')}</small>{['FRIEND_REQUEST', 'FRIEND_ACCEPTED'].includes(row.type) && <button className={styles.link} type="button" onClick={() => setPanel('friends')}>Open Friends</button>}{row.type === 'PARTY_INVITE' && <span><button className={styles.link} type="button" disabled={busy === row.eventId} onClick={() => void respond(row, 'accept')}>Accept</button><button className={styles.link} type="button" disabled={busy === row.eventId} onClick={() => void respond(row, 'decline')}>Decline</button></span>}</li>)}</ul>}
    <button className={styles.link} type="button" onClick={() => setPanel('friends')}>See friends and pending requests →</button>
  </div>
}
