import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '@/features/auth'
import { Button, Icon, useToast } from '@/shared/ui'
import { paths } from '@/shared/config/paths'
import { PartyPanel, useLeaveParty, useParty } from '@/features/community'
import { useQueue } from './MatchmakingContext'
import MatchRadar from './components/MatchRadar'
import QueueRoster from './components/QueueRoster'
import ProposalTable from './components/ProposalTable'
import styles from './RankedPage.module.css'

const clock = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

export default function RankedPage() {
  const [params] = useSearchParams()
  const state = useQueue()
  const { user } = useAuth()
  const navigate = useNavigate()
  const notify = useToast()
  const lastParty = useRef(null)
  const leaveParty = useLeaveParty()
  const [leaving, setLeaving] = useState(false)
  const [now, setNow] = useState(Date.now)
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(timer) }, [])
  const partyRequested = params.get('mode') === 'PARTY'
  const mode = state.activeMode || (['NORMAL', 'PARTY'].includes(params.get('mode')) ? 'NORMAL' : 'RANK')
  // Outside a Rank search the party matters too: a party can't play Ranked, so its members belong in the party room.
  const partyState = useParty(state.activeMode !== 'RANK')
  const party = partyState.data?.partyId ? partyState.data : null
  useEffect(() => {
    if (mode === 'RANK' && !state.activeMode && party) navigate(`${paths.ranked}?mode=PARTY`, { replace: true })
  }, [mode, state.activeMode, party, navigate])
  useEffect(() => {
    if (mode !== 'NORMAL') { lastParty.current = null; return }
    if (partyState.loading || partyState.error) return
    if (party) { lastParty.current = party.partyId; return }
    if (lastParty.current) {
      lastParty.current = null
      notify('The party was disbanded or you’re no longer a member. You’re back in the lobby.')
      navigate(paths.lobby, { replace: true })
    }
  }, [mode, party, partyState.loading, partyState.error, notify, navigate])
  const isParty = mode === 'NORMAL' && (partyRequested || Boolean(party))
  const canManageParty = !isParty || party?.leaderId === user?.accountId
  const current = mode === 'NORMAL' ? state.normal : state.rank
  const queue = current.queue
  const status = queue?.status
  const idle = status === 'NONE' || status === 'FAILED'
  const proposed = status === 'PROPOSED'
  const deadline = proposed ? queue?.acceptDeadline : queue?.matchStartDeadline
  const remaining = deadline ? Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000)) : null
  const elapsed = queue?.joinedAt ? Math.floor(Math.max(0, now - Date.parse(queue.joinedAt)) / 1000) : 0
  const max = Math.max(2, Math.min(10, queue?.maxPlayers || 6))
  const preparing = idle || !queue
  const roster = preparing ? { status: isParty ? 'PARTY' : 'PREPARING', playerIds: isParty ? party?.memberIds || [] : [user.accountId], leaderId: party?.leaderId } : queue
  const count = Math.max(0, preparing ? roster.playerIds.length : queue?.playerCount ?? queue?.playerIds?.length ?? 0)
  const inMatch = status === 'READY' && Boolean(queue?.tableId)
  // Back to the lobby also takes you out of your party, so the lobby no longer keeps you in the party room.
  async function backToLobby() {
    if (!party) { navigate(paths.lobby); return }
    setLeaving(true)
    try {
      const message = await leaveParty(party.leaderId === user?.accountId)
      if (message) { notify(message); navigate(paths.lobby) }
    } catch (failure) { notify(failure.message) } finally { setLeaving(false) }
  }
  async function cancel() {
    if (await current.leave()) { state.close(); if (!isParty) navigate(paths.lobby) }
  }
  if (['PROPOSED', 'CREATING_TABLE'].includes(status) && queue?.proposalId) return <ProposalTable key={queue.proposalId} queue={queue} user={user} current={current} state={state} remaining={remaining} mode={mode} />
  return <div className={styles.page}>
    <section className={styles.panel} aria-label="Match setup">
      <header className={styles.header}>
        <div className={styles.heading}><span className={styles.emblem}><Icon name={isParty ? 'groups' : 'military_tech'} /></span><div><h1>{isParty ? 'Party room' : mode === 'RANK' ? 'Ranked' : 'Casual'}</h1><p className={styles.meta}>{isParty ? 'Casual with your party' : 'Solo'} · {max} players · No-Limit Hold’em</p></div></div>
      </header>
      <div className={styles.main}>
        <MatchRadar elapsed={clock(status === 'COUNTDOWN' && remaining != null ? remaining : elapsed)} title={status === 'COUNTDOWN' ? 'Waiting for more players' : preparing ? isParty ? 'Waiting for friends to join' : 'Ready to search' : 'Finding a table'} active={!preparing} detail={status === 'COUNTDOWN' ? 'When time is up, the table moves to confirmation' : preparing && isParty ? 'Share the code and password. The leader starts the search when everyone’s ready.' : queue?.position != null ? `Queue position: #${queue.position}` : 'Status updates from the server'} />
        <aside className={styles.side}>
          {!isParty && <div className={styles.performance}><div className={styles.sectionTitle}><Icon name="hotel_class" /><h2>Matchmaking</h2></div>
            <div className={styles.stats}><div><span>{preparing && isParty ? 'Party members' : 'Waiting'}</span><strong>{count} / {max}</strong><i /></div><div><span>Minimum to start</span><strong>{queue?.minPlayers ?? '—'}</strong><i /></div></div>
            <div className={styles.player}><Icon name="person" /><div><strong>{user?.profile?.displayName || user?.email || 'You'}</strong><p>{mode === 'RANK' ? 'Matched by Elo · Confirmation required' : 'Play solo or with your party'}</p></div></div>
          </div>}
          {isParty && <PartyPanel room />}
        </aside>
      </div>
      <div className={styles.gathering}>
        <div className={styles.progress}><strong>{preparing && isParty ? 'Party members' : 'Table progress'} <b>{count}/{max}</b></strong><span>{preparing ? isParty ? 'Ready to search Casual with your party' : 'Ready to join the queue' : 'Updating match progress…'}</span></div>
        <QueueRoster queue={roster} user={user} max={max} count={count} />
      </div>
      {current.error && <p className={styles.error} role="alert">{current.error}</p>}
      {partyState.error && <p className={styles.error} role="alert">{partyState.error}</p>}
      <footer className={styles.footer}><span><Icon name="lock" /><span>{isParty ? canManageParty ? 'The leader starts and cancels the search for the whole party' : 'Waiting for the leader to start the search' : 'The server handles confirmation and table creation'}</span></span><div className={styles.actions}>
        {idle && <><Button disabled={leaving} onClick={backToLobby}>Back to lobby</Button><Button variant="primary" disabled={state.pending || !canManageParty || partyState.loading || Boolean(partyState.error) || (isParty && !party)} onClick={() => state.start(mode)}>{isParty ? 'Find match with party' : 'Find match'}</Button></>}
        {['WAITING', 'COUNTDOWN'].includes(status) && <Button disabled={state.pending || !canManageParty || state.leaderOnly} onClick={cancel}>Cancel search</Button>}
        {proposed && <><Button disabled={state.pending || remaining === 0} onClick={state.decline}>Decline</Button><Button variant="primary" disabled={state.pending || current.accepted || remaining === 0} onClick={state.accept}>{current.accepted ? 'Confirmed' : 'Accept match'}</Button></>}
        {inMatch && <Button variant="primary" onClick={() => navigate(paths.tableById(queue.tableId))}>Back to table</Button>}
      </div></footer>
    </section>
  </div>
}
