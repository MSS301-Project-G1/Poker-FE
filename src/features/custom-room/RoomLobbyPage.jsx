import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Button, Eyebrow, Icon } from '@/shared/ui'
import * as rooms from './api/roomApi'
import Panel from './components/Panel'
import RoomControls from './components/RoomControls'
import RoomHeading from './components/RoomHeading'
import SeatList from './components/SeatList'
import { useDevUser } from './hooks/useDevUser'
import { useRoom } from './hooks/useRoom'
import { RoomRuntimeContext } from './runtime'
import styles from './RoomLobbyPage.module.css'

// Local identities carry over so the game table acts as the same player.
const tableLink = (tableId, devUser) => `${paths.tableById(tableId)}${devUser ? `?devUser=${devUser}` : ''}`

export default function RoomLobbyPage() {
  const { roomCode } = useParams()
  const [attempt, setAttempt] = useState(0)
  const code = roomCode.toUpperCase()
  return <RoomLobby key={`${code}:${attempt}`} roomCode={code} retry={() => setAttempt(value => value + 1)} />
}

function RoomLobby({ roomCode, retry }) {
  const navigate = useNavigate()
  const runtime = useContext(RoomRuntimeContext)
  const devUser = useDevUser()
  const session = useRoom({ code: roomCode, devUser, getAccessToken: runtime.getAccessToken })
  const { room } = session
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const previousStatus = useRef(null)

  const accountId = devUser || runtime.accountId
  const me = room?.members.find(member => member.accountId === accountId)
  const isOwner = room?.ownerId === accountId

  // Follow the table when this room's match starts while the player waits here.
  useEffect(() => {
    if (!room) return
    if (previousStatus.current === 'WAITING' && room.status === 'PLAYING' && room.tableId) navigate(tableLink(room.tableId, devUser))
    previousStatus.current = room.status
  }, [room, navigate, devUser])

  const act = async (action, ...args) => {
    setBusy(true)
    setActionError('')
    try {
      const updated = await action(roomCode, ...args, { accessToken: await runtime.getAccessToken(), devUser })
      if (updated) session.apply(updated)
      return updated
    } catch (failure) {
      setActionError(failure.message)
      throw failure
    } finally { setBusy(false) }
  }
  const quietly = promise => promise.catch(() => {})

  if (session.phase === 'loading') return <div className={styles.page}><Panel className={styles.state} role="status"><div className={styles.spinner} />Opening the room…</Panel></div>
  if (session.phase === 'error') return <div className={styles.page}><Panel className={styles.state} role="alert">
    <p className={styles.error}>{session.error}</p><Button variant="primary" onClick={retry}>Try again</Button></Panel></div>
  if (session.phase === 'gone') return <div className={styles.page}><Panel className={styles.state}>
    <Icon name="playing_cards" className={styles.stateIcon} /><h1 className={styles.stateTitle}>You are not in this room</h1>
    <p className={styles.muted}>{session.error}</p><Button variant="primary" onClick={() => navigate(paths.rooms)}>Find a room</Button></Panel></div>

  return <div className={styles.page}>
    <div className={styles.top}>
      <RoomHeading room={room} connectionError={session.error} />
      <Button onClick={() => navigate(paths.rooms)}>All rooms</Button>
    </div>
    {room.status === 'PLAYING' && <Panel className={styles.playing} aria-label="Match in progress">
      <div><Eyebrow>MATCH IN PROGRESS</Eyebrow><p className={styles.muted}>The room returns here when the match ends.</p></div>
      {room.tableId && <Button variant="primary" onClick={() => navigate(tableLink(room.tableId, devUser))}>Open table</Button>}
    </Panel>}
    <div className={styles.grid}>
      <Panel aria-label="Players">
        <Eyebrow>SEATING ORDER</Eyebrow>
        <h2 className={styles.sectionTitle}>Players</h2>
        <SeatList room={room} accountId={accountId} profiles={runtime.profiles} busy={busy}
          onKick={target => quietly(act(rooms.kickMember, target))}
          onTransfer={target => quietly(act(rooms.transferOwner, target))} />
      </Panel>
      <RoomControls room={room} me={me} isOwner={isOwner} busy={busy} error={actionError}
        onStart={() => quietly(act(rooms.startRoom))}
        onReady={ready => quietly(act(rooms.setReady, ready))}
        onInvite={target => act(rooms.inviteFriend, target)}
        onLeave={() => quietly(act(rooms.leaveRoom).then(() => navigate(paths.rooms)))} />
    </div>
  </div>
}
