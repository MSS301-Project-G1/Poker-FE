import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Button, Icon, useConfirm, useToast } from '@/shared/ui'
import { gatewayRequest } from '@/shared/api/gatewayClient'
import { useCommunity } from '../CommunityContext'
import { communityApi as api } from '../api/communityApi'
import { useResource } from '../hooks/useResource'
import { useLeaveParty } from '../hooks/useLeaveParty'
import { Avatar, Empty, ErrorNotice, Name } from './CommunityUI'
import styles from '../Community.module.css'

const partyCodePattern = /^[A-Z0-9]{8}$/
const partyPasswordPattern = /^\d{6}$/
const kickPrompt = name => ({
  title: 'Remove from party?', message: `${name} will leave the party. The party password will change so they can’t rejoin with the old one.`,
  confirmLabel: 'Remove from party', icon: 'person_remove', danger: true,
})

export default function PartyPanel({ room = false }) {
  const navigate = useNavigate()
  const openRoom = () => navigate(`${paths.ranked}?mode=PARTY`)
  const { user, loadProfiles, profiles, sendFriendRequest } = useCommunity()
  const confirm = useConfirm()
  const notify = useToast()
  const leaveParty = useLeaveParty()
  const loader = useCallback(async signal => {
    const [party, queue] = await Promise.all([api.party(signal), apiQueue(signal)])
    return { party: party?.partyId ? party : null, queue }
  }, [])
  const { data, loading, error, reload } = useResource(loader, 5000)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState('')
  const [message, setMessage] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const canJoin = partyCodePattern.test(code) && partyPasswordPattern.test(password)
  const party = data?.party
  const leader = party?.leaderId === user?.accountId
  const locked = Boolean(data?.queue?.status && !['NONE', 'FAILED'].includes(data.queue.status))
  useEffect(() => { if (party) void loadProfiles(party.memberIds) }, [party, loadProfiles])

  async function run(operation, success, enterRoom = false) {
    if (busy) return
    setBusy(true); setFailure(''); setMessage('')
    try { await operation(); setMessage(success); reload(); if (enterRoom) openRoom() } catch (failure) { setFailure(failure.message) } finally { setBusy(false) }
  }
  async function leaveGroup() {
    if (busy) return
    setBusy(true); setFailure('')
    try {
      const message = await leaveParty(leader)
      if (!message) return
      if (room) { notify(message); navigate(paths.lobby) }
      else { setMessage(message); reload() }
    } catch (failure) { setFailure(failure.message) }
    finally { setBusy(false) }
  }
  async function openMember(id) {
    if (!id || id === user?.accountId) return
    setSelectedMember(id)
  }
  return <section className={`${room ? styles.partyRoom : styles.card} ${locked ? styles.locked : ''}`} aria-labelledby="party-title">
    <header className={styles.cardHead}>
      <div className="flex items-center gap-space-sm min-w-0">
        <span className={styles.modeIcon} aria-hidden="true"><Icon name={room ? 'groups' : 'casino'} /></span>
        <div className="flex flex-col min-w-0">
          <h2 id="party-title" className={styles.modeTitle}>{room ? 'Party' : 'Casual'}</h2>
        </div>
      </div>
      {party && <span className={styles.muted}>{party.memberIds.length} {party.memberIds.length === 1 ? 'member' : 'members'}</span>}
    </header>
    <ErrorNotice message={error || failure} retry={error ? reload : null} />
    {message && <p className={styles.success} role="status">{message}</p>}
    {loading ? <Empty>Checking your party…</Empty> : !data ? null : party && !room ? <div className={styles.partyActions}>
      <p className={styles.tagline}>Room open · Start or invite friends</p>
      <Button className={styles.secondaryAction} onClick={openRoom}><Icon name="meeting_room" />Join room</Button>
    </div> : !party ? <div className={styles.partyActions}>
      <p className={`${styles.tagline} short:hidden`}>Create a room and start playing, or send the code to friends</p>
      <Button
        type="button"
        variant="primary"
        className={styles.primaryAction}
        disabled={busy || locked}
        onClick={() => run(api.createParty, 'Room created.', true)}
      >
        <Icon name="bolt" />Create room
      </Button>
      <form className={styles.partyForm} onSubmit={event => { event.preventDefault(); if (canJoin) void run(() => api.joinParty(code, password), 'Joined the room.', true) }}>
        <div className={styles.inputsRow}>
          <label htmlFor="party-code" className={styles.srOnly}>Friend’s room code</label>
          <input
            id="party-code"
            className={styles.compactInput}
            value={code}
            autoComplete="off"
            placeholder="Room code"
            onChange={event => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
          />
          <label htmlFor="party-password" className={styles.srOnly}>Password</label>
          <input
            id="party-password"
            className={styles.compactPassword}
            value={password}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Password (6 digits)"
            onChange={event => setPassword(event.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <Button
            type="submit"
            variant="secondary"
            className={`${styles.secondaryAction} ${styles.inlineJoin}`}
            aria-label="Join room"
            disabled={busy || locked || !canJoin}
          >
            <Icon name="login" />Join
          </Button>
        </div>
      </form>
    </div> : <div className={styles.activePartyBody}>
      <div className={styles.partyCode}><span className={styles.muted}>Party code</span><code>{party.partyCode}</code><button type="button" className={styles.iconButton} aria-label="Copy party code" onClick={() => run(() => navigator.clipboard.writeText(party.partyCode), 'Party code copied.')}><Icon name="content_copy" /></button></div>
      {party.password && <div className={styles.partyCode}><span className={styles.muted}>Password</span><code>{party.password}</code><button type="button" className={styles.iconButton} aria-label="Copy party password" onClick={() => run(() => navigator.clipboard.writeText(party.password), 'Party password copied.')}><Icon name="content_copy" /></button></div>}
      <p className={`${styles.hint} short:!hidden`}><Icon name="share" />Send the code and password to friends so they can join.</p>
      {locked && <p className={styles.hint}><Icon name="lock" />Party is searching — members are locked.</p>}
      <details className={styles.partyMembers}><summary>Manage members · {party.memberIds.length}</summary><ul className={styles.list}>{party.memberIds.map(id => <li className={styles.row} key={id}><button type="button" className={styles.memberAvatarButton} onClick={() => openMember(id)} aria-label={`View ${profiles[id]?.displayName || 'player'} profile`}><Avatar id={id} /></button><span className={styles.person}><strong><Name id={id} /></strong>{id === user?.accountId && <small className={styles.muted}>You</small>}</span>{id === party.leaderId && <span className={styles.leader} title="Leader"><Icon name="crown" /></span>}{leader && id !== user?.accountId && <button className={styles.iconButton} type="button" aria-label="Remove member" disabled={busy || locked} onClick={async () => { if (await confirm(kickPrompt(profiles[id]?.displayName || 'This player'))) void run(() => api.kick(id), 'Player removed. The party password has changed.') }}><Icon name="person_remove" /></button>}{selectedMember === id && <div className={styles.memberPopover}><strong><Name id={id} /></strong>{id !== user?.accountId && <Button type="button" onClick={() => void sendFriendRequest(id)}><Icon name="person_add" />Add friend</Button>}</div>}</li>)}</ul></details>
      <Button className={styles.full} disabled={busy || locked} onClick={leaveGroup}>Leave party</Button>
    </div>}
  </section>
}

// Keep queue authentication on the same gateway client as existing matchmaking.
const apiQueue = signal => gatewayRequest('/api/matchmaking/normal/status', { signal })
