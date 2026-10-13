import { useState } from 'react'

function RoomRow({ room, disabled, onJoin }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const full = room.playerCount >= room.maxPlayers

  const join = async event => {
    event.preventDefault()
    event.stopPropagation()
    setBusy(true)
    setError('')
    try { await onJoin(room.roomCode, password || null) }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <li className="room-list-item">
    <form onSubmit={join} aria-label={`Room ${room.roomCode}`}>
      <div className="room-list-main">
        <strong className="room-code">{room.roomCode}</strong>
        <span>{room.smallBlind} / {room.bigBlind} blinds</span>
        <span className={full ? 'room-full' : ''}>{room.playerCount} / {room.maxPlayers} seated</span>
        {room.hasPassword && <span className="room-lock"><span className="material-symbols-outlined" aria-hidden="true">lock</span>Password</span>}
      </div>
      <div className="room-list-actions">
        {room.hasPassword && <input type="password" aria-label={`Password for room ${room.roomCode}`} placeholder="Password" value={password} onChange={event => setPassword(event.target.value)} />}
        <button className="room-secondary" disabled={disabled || busy || full}>{full ? 'Full' : busy ? 'Joining…' : 'Join'}</button>
      </div>
    </form>
    {error && <p className="room-error" role="alert">{error}</p>}
  </li>
}

export default function PublicRooms({ result, error, page, disabled, onPage, onRefresh, onJoin }) {
  return <section className="room-card" aria-label="Public rooms">
    <header className="room-section-header"><div><span className="room-eyebrow">OPEN TABLES</span><h2>Public rooms</h2></div>
      <button className="room-secondary" onClick={onRefresh}><span className="material-symbols-outlined" aria-hidden="true">refresh</span> Refresh</button></header>
    {error && <p className="room-error" role="alert">{error}</p>}
    {!result && !error && <p className="room-muted" role="status">Loading rooms…</p>}
    {result?.content.length === 0 && <p className="room-muted">No public rooms are waiting. Create one and invite your friends.</p>}
    {result?.content.length > 0 && <ul className="room-list">{result.content.map(room => <RoomRow key={room.id} room={room} disabled={disabled} onJoin={onJoin} />)}</ul>}
    {result?.totalPages > 1 && <footer className="room-pager">
      <button className="room-secondary" disabled={page === 0} onClick={() => onPage(page - 1)}>Previous</button>
      <span>Page {page + 1} of {result.totalPages}</span>
      <button className="room-secondary" disabled={page + 1 >= result.totalPages} onClick={() => onPage(page + 1)}>Next</button>
    </footer>}
  </section>
}
