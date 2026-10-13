import { useContext, useEffect, useRef, useState } from 'react'
import { RoomRuntimeContext, devIdentity } from './runtime'
import { roomRequest, tableUrl } from './roomApi'
import { useRoom } from './useRoom'
import SeatList from './components/SeatList'
import InviteForm from './components/InviteForm'
import './custom-room.css'

export default function RoomLobbyPage({ roomCode, navigate }) {
  const [attempt, setAttempt] = useState(0)
  return <RoomLobby key={attempt} roomCode={roomCode} navigate={navigate} retry={() => setAttempt(value => value + 1)} />
}

function RoomLobby({ roomCode, navigate, retry }) {
  const runtime = useContext(RoomRuntimeContext)
  const devUser = devIdentity()
  const session = useRoom({ code: roomCode, devUser, getAccessToken: runtime.getAccessToken })
  const { room } = session
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [copied, setCopied] = useState(false)
  const previousStatus = useRef(null)

  const accountId = devUser || runtime.accountId
  const me = room?.members.find(member => member.accountId === accountId)
  const isOwner = room?.ownerId === accountId
  const others = room?.members.filter(member => !member.owner) || []
  const canStart = room?.status === 'WAITING' && room.members.length >= 2 && others.every(member => member.ready)

  // Follow the table when this room's match starts while the player waits here.
  useEffect(() => {
    if (!room) return
    if (previousStatus.current === 'WAITING' && room.status === 'PLAYING' && room.tableId) navigate(tableUrl(room.tableId, devUser))
    previousStatus.current = room.status
  }, [room, navigate, devUser])

  const act = async (path, options = {}) => {
    setBusy(true)
    setActionError('')
    try {
      const updated = await roomRequest(`/api/rooms/${encodeURIComponent(roomCode)}${path}`,
        { ...options, accessToken: await runtime.getAccessToken(), devUser })
      if (updated) session.apply(updated)
      return updated
    } catch (failure) {
      setActionError(failure.message)
      throw failure
    } finally { setBusy(false) }
  }
  const quietly = promise => promise.catch(() => {})
  const leave = () => quietly(act('/leave', { method: 'POST' }).then(() => navigate('/rooms')))
  const copy = async () => {
    try { await navigator.clipboard.writeText(roomCode); setCopied(true) } catch { setCopied(false) }
  }

  return <div className="room-page">
    <header className="room-header"><a href="/lobby" className="room-brand"><span>♠</span> POKER<span>RANK</span></a>
      <nav><button className="room-secondary" onClick={() => navigate('/rooms')}>All rooms</button></nav></header>
    <main className="room-main">
      {session.phase === 'loading' && <div className="room-state" role="status"><div className="room-spinner" />Opening the room…</div>}
      {session.phase === 'error' && <div className="room-state" role="alert"><p className="room-error">{session.error}</p>
        <button className="room-primary" onClick={retry}>Try again</button></div>}
      {session.phase === 'gone' && <div className="room-state"><span className="room-state-icon">♠</span><h1>You are not in this room</h1>
        <p className="room-muted">{session.error}</p><button className="room-primary" onClick={() => navigate('/rooms')}>Find a room</button></div>}
      {room && session.phase !== 'gone' && <>
        <section className="room-hero room-lobby-hero">
          <div><span className="room-eyebrow">{room.visibility === 'PUBLIC' ? 'PUBLIC ROOM' : 'PRIVATE ROOM'}{room.hasPassword ? ' · PASSWORD' : ''}</span>
            <h1>Room <button className="room-code-copy" onClick={copy} aria-label={`Copy room code ${room.roomCode}`}>{room.roomCode}<span className="material-symbols-outlined" aria-hidden="true">{copied ? 'check' : 'content_copy'}</span></button></h1>
            <p className="room-muted">Blinds {room.smallBlind} / {room.bigBlind} · {room.members.length} of {room.maxPlayers} seats · No entry fee, no Elo change</p></div>
          {session.error && <p className="room-notice" role="status">Connection issue: {session.error} Retrying…</p>}
        </section>
        {room.status === 'PLAYING' && <section className="room-card room-playing" aria-label="Match in progress">
          <div><span className="room-eyebrow">MATCH IN PROGRESS</span><p>The room returns here when the match ends.</p></div>
          {room.tableId && <button className="room-primary" onClick={() => navigate(tableUrl(room.tableId, devUser))}>Open table</button>}
        </section>}
        <div className="room-lobby-grid">
          <section className="room-card" aria-label="Players">
            <header className="room-section-header"><div><span className="room-eyebrow">SEATING ORDER</span><h2>Players</h2></div></header>
            <SeatList room={room} accountId={accountId} profiles={runtime.profiles} busy={busy}
              onKick={target => quietly(act(`/members/${target}`, { method: 'DELETE' }))}
              onTransfer={target => quietly(act('/owner', { method: 'PUT', body: { accountId: target } }))} />
          </section>
          <aside className="room-card room-controls" aria-label="Room controls">
            {actionError && <p className="room-error" role="alert">{actionError}</p>}
            {room.status === 'WAITING' && isOwner && <>
              <button className="room-primary room-start" disabled={busy || !canStart} onClick={() => quietly(act('/start', { method: 'POST' }))}>Start match</button>
              <p className="room-muted">{room.members.length < 2 ? 'Waiting for at least one more player.' : canStart ? 'Everyone is ready.' : 'Waiting for every player to be ready.'}</p>
            </>}
            {room.status === 'WAITING' && me && !isOwner && <button className={me.ready ? 'room-secondary room-start' : 'room-primary room-start'} disabled={busy}
              onClick={() => quietly(act('/ready', { method: 'PUT', body: { ready: !me.ready } }))}>{me.ready ? 'Not ready' : "I'm ready"}</button>}
            <InviteForm disabled={busy} onInvite={target => act('/invitations', { method: 'POST', body: { accountId: target } })} />
            <button className="room-secondary room-leave" disabled={busy || room.status !== 'WAITING'} onClick={leave}>Leave room</button>
          </aside>
        </div>
      </>}
    </main>
  </div>
}
