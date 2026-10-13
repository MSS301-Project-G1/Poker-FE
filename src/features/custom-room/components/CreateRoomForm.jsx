import { useState } from 'react'

const blinds = [[10, 20], [25, 50], [50, 100], [100, 200]]

export default function CreateRoomForm({ disabled, onCreate }) {
  const [visibility, setVisibility] = useState('PUBLIC')
  const [password, setPassword] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(6)
  const [blindIndex, setBlindIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async event => {
    event.preventDefault()
    event.stopPropagation()
    setBusy(true)
    setError('')
    try {
      const [smallBlind, bigBlind] = blinds[blindIndex]
      await onCreate({ visibility, password: password || null, maxPlayers, smallBlind, bigBlind })
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <form className="room-card room-form" aria-label="Create a room" onSubmit={submit}>
    <span className="room-eyebrow">HOST A TABLE</span><h2>Create a room</h2>
    <fieldset className="room-segmented"><legend>Visibility</legend>
      {[['PUBLIC', 'Public', 'Listed for everyone'], ['PRIVATE', 'Private', 'Join by code only']].map(([value, label, hint]) =>
        <label key={value} className={visibility === value ? 'room-selected' : ''}><input type="radio" name="visibility" value={value} checked={visibility === value} onChange={() => setVisibility(value)} /><strong>{label}</strong><small>{hint}</small></label>)}
    </fieldset>
    <div className="room-fields">
      <label>Seats<select value={maxPlayers} onChange={event => setMaxPlayers(Number(event.target.value))}>{[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} players</option>)}</select></label>
      <label>Blinds<select value={blindIndex} onChange={event => setBlindIndex(Number(event.target.value))}>{blinds.map(([small, big], index) => <option key={small} value={index}>{small} / {big}</option>)}</select></label>
    </div>
    <label>Password <small>(optional, 4–32 characters)</small><input type="password" autoComplete="new-password" minLength={4} maxLength={32} value={password} onChange={event => setPassword(event.target.value)} placeholder="Leave empty for an open room" /></label>
    {error && <p className="room-error" role="alert">{error}</p>}
    <button className="room-primary" disabled={disabled || busy}>{busy ? 'Creating…' : 'Create room'}</button>
  </form>
}
