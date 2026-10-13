import { useCallback, useContext, useEffect, useState } from 'react'
import { RoomRuntimeContext, devIdentity } from './runtime'
import { roomRequest } from './roomApi'
import CreateRoomForm from './components/CreateRoomForm'
import JoinRoomForm from './components/JoinRoomForm'
import PublicRooms from './components/PublicRooms'
import './custom-room.css'

const PAGE_SIZE = 10

export default function RoomsPage({ navigate }) {
  const runtime = useContext(RoomRuntimeContext)
  const devUser = devIdentity()
  const [identity, setIdentity] = useState(devUser ? 'signed-in' : 'checking')
  const [rooms, setRooms] = useState(null)
  const [listError, setListError] = useState('')
  const [page, setPage] = useState(0)
  const [version, setVersion] = useState(0)

  const call = useCallback(async (path, options = {}) =>
    roomRequest(path, { ...options, accessToken: await runtime.getAccessToken(), devUser }), [runtime, devUser])

  // A player belongs to one open room at a time; resume it after a reload.
  useEffect(() => {
    const abort = new AbortController()
    call('/api/rooms/me', { signal: abort.signal }).then(room => {
      if (room?.roomCode) navigate(`/rooms/${room.roomCode}`)
      else setIdentity('signed-in')
    }).catch(error => {
      if (error.name !== 'AbortError') setIdentity(error.status === 401 ? 'signed-out' : 'signed-in')
    })
    return () => abort.abort()
  }, [call, navigate])

  useEffect(() => {
    const abort = new AbortController()
    call(`/api/rooms?page=${page}&size=${PAGE_SIZE}`, { signal: abort.signal })
      .then(result => { setRooms(result); setListError('') })
      .catch(error => { if (error.name !== 'AbortError') setListError(error.message) })
    return () => abort.abort()
  }, [call, page, version])

  const open = room => navigate(`/rooms/${room.roomCode}`)
  const create = async settings => open(await call('/api/rooms', { method: 'POST', body: settings }))
  const join = async (code, password) => open(await call(`/api/rooms/${encodeURIComponent(code)}/join`, { method: 'POST', body: { password } }))
  const signedOut = identity === 'signed-out'

  return <div className="room-page">
    <header className="room-header"><a href="/lobby" className="room-brand"><span>♠</span> POKER<span>RANK</span></a>
      <nav><button className="room-secondary" onClick={() => navigate('/lobby')}>Lobby</button></nav></header>
    <main className="room-main">
      <section className="room-hero"><span className="room-eyebrow">CUSTOM ROOMS</span><h1>Play with your crew</h1>
        <p className="room-muted">Open a private table, share the code and start when everyone is ready. Custom games are free and do not change Elo.</p></section>
      {signedOut && <p className="room-notice" role="status">Sign in to create or join rooms.</p>}
      <div className="room-grid">
        <CreateRoomForm disabled={signedOut} onCreate={create} />
        <JoinRoomForm disabled={signedOut} onJoin={join} />
      </div>
      <PublicRooms result={rooms} error={listError} page={page} disabled={signedOut} onPage={setPage}
        onRefresh={() => setVersion(value => value + 1)} onJoin={join} />
    </main>
  </div>
}
