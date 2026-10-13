import { useState } from 'react'

export default function JoinRoomForm({ disabled, onJoin }) {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async event => {
    event.preventDefault()
    event.stopPropagation()
    setBusy(true)
    setError('')
    try { await onJoin(code.trim().toUpperCase(), password || null) }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <form className="room-card room-form" aria-label="Join with a code" onSubmit={submit}>
    <span className="room-eyebrow">GOT AN INVITE?</span><h2>Join with a code</h2>
    <label>Room code<input className="room-code-input" required minLength={4} maxLength={16} autoComplete="off" spellCheck="false" value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="ABC123" /></label>
    <label>Password <small>(if the room has one)</small><input type="password" autoComplete="off" value={password} onChange={event => setPassword(event.target.value)} /></label>
    {error && <p className="room-error" role="alert">{error}</p>}
    <button className="room-primary" disabled={disabled || busy || !code.trim()}>{busy ? 'Joining…' : 'Join room'}</button>
  </form>
}
