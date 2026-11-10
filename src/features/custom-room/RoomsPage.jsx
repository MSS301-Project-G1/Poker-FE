import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Eyebrow } from '@/shared/ui'
import { createRoom, fetchMyRoom, fetchPublicRooms, joinRoom } from './api/roomApi'
import CreateRoomForm from './components/CreateRoomForm'
import JoinRoomForm from './components/JoinRoomForm'
import Message from './components/Message'
import PublicRooms from './components/PublicRooms'
import RoomInvites from './components/RoomInvites'
import { useDevUser } from './hooks/useDevUser'
import { useProfiles } from './hooks/useProfiles'
import { useRoomInvites } from './hooks/useRoomInvites'
import styles from './RoomsPage.module.css'

const PAGE_SIZE = 10

export default function RoomsPage() {
  const navigate = useNavigate()
  const devUser = useDevUser()
  const [account, setAccount] = useState(devUser ? 'signed-in' : 'checking')
  const [rooms, setRooms] = useState(null)
  const [listError, setListError] = useState('')
  const [page, setPage] = useState(0)
  const [version, setVersion] = useState(0)
  const invites = useRoomInvites()
  const inviters = useProfiles(invites.map(invite => invite.inviterId))

  const identity = useCallback(async signal => ({ devUser, signal }), [devUser])

  // A player belongs to one open room at a time; resume it after a reload.
  useEffect(() => {
    const abort = new AbortController()
    identity(abort.signal).then(fetchMyRoom).then(room => {
      if (room?.roomCode) navigate(paths.roomByCode(room.roomCode), { replace: true })
      else setAccount('signed-in')
    }).catch(error => {
      if (error.name !== 'AbortError') setAccount(error.status === 401 ? 'signed-out' : 'signed-in')
    })
    return () => abort.abort()
  }, [identity, navigate])

  useEffect(() => {
    const abort = new AbortController()
    identity(abort.signal).then(auth => fetchPublicRooms(page, PAGE_SIZE, auth))
      .then(result => { setRooms(result); setListError('') })
      .catch(error => { if (error.name !== 'AbortError') setListError(error.message) })
    return () => abort.abort()
  }, [identity, page, version])

  const open = room => navigate(paths.roomByCode(room.roomCode))
  const create = async settings => open(await createRoom(settings, await identity()))
  const join = async (code, password) => open(await joinRoom(code, password, await identity()))
  const signedOut = account === 'signed-out'

  return <div className={styles.page}>
    <section>
      <Eyebrow>CUSTOM ROOMS</Eyebrow>
      <h1 className={styles.title}>Play with your crew</h1>
      <p className={styles.muted}>Open a private table, share the code and start when everyone is ready. Custom games are free and do not change Elo.</p>
    </section>
    {signedOut && <Message tone="notice">Sign in to create or join rooms.</Message>}
    <div className={styles.grid}>
      <CreateRoomForm disabled={signedOut} onCreate={create} />
      <div className={styles.side}>
        {invites.length > 0 && <RoomInvites invites={invites} profiles={inviters} disabled={signedOut} onJoin={join} />}
        <JoinRoomForm disabled={signedOut} onJoin={join} />
        <PublicRooms result={rooms} error={listError} page={page} disabled={signedOut} onPage={setPage}
          onRefresh={() => setVersion(value => value + 1)} onJoin={join} />
      </div>
    </div>
  </div>
}
