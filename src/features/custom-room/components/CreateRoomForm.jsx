import { useState } from 'react'
import { Button, Eyebrow } from '@/shared/ui'
import Field from './Field'
import Message from './Message'
import Panel from './Panel'
import styles from './CreateRoomForm.module.css'

const visibilities = [
  { value: 'PUBLIC', label: 'Public', hint: 'Listed for everyone' },
  { value: 'PRIVATE', label: 'Private', hint: 'Join by code only' },
]
const seatOptions = [2, 3, 4, 5, 6].map(count => ({ value: count, label: `${count} players` }))
const blinds = [[10, 20], [25, 50], [50, 100], [100, 200]]
const blindOptions = blinds.map(([small, big], index) => ({ value: index, label: `${small} / ${big}` }))

export default function CreateRoomForm({ disabled, onCreate }) {
  const [visibility, setVisibility] = useState('PUBLIC')
  const [password, setPassword] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(6)
  const [blindIndex, setBlindIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const [smallBlind, bigBlind] = blinds[blindIndex]
      await onCreate({ visibility, password: password || null, maxPlayers, smallBlind, bigBlind })
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <Panel as="form" className={styles.form} aria-label="Create a room" onSubmit={submit}>
    <div><Eyebrow>HOST A TABLE</Eyebrow><h2 className={styles.title}>Create a room</h2></div>
    <fieldset className={styles.segmented}>
      <legend className={styles.legend}>Visibility</legend>
      {visibilities.map(option => <label key={option.value} className={`${styles.choice} ${visibility === option.value ? styles.selected : ''}`}>
        <input className={styles.radio} type="radio" name="visibility" value={option.value}
          checked={visibility === option.value} onChange={() => setVisibility(option.value)} />
        <strong className={styles.choiceLabel}>{option.label}</strong><small>{option.hint}</small>
      </label>)}
    </fieldset>
    <div className={styles.pair}>
      <Field label="Seats" options={seatOptions} value={maxPlayers} onChange={event => setMaxPlayers(Number(event.target.value))} />
      <Field label="Blinds" options={blindOptions} value={blindIndex} onChange={event => setBlindIndex(Number(event.target.value))} />
    </div>
    <Field label="Password" hint="(optional, 4–32 characters)" type="password" autoComplete="new-password" minLength={4} maxLength={32}
      value={password} onChange={event => setPassword(event.target.value)} placeholder="Leave empty for an open room" />
    {error && <Message tone="error">{error}</Message>}
    <Button variant="primary" type="submit" disabled={disabled || busy}>{busy ? 'Creating…' : 'Create room'}</Button>
  </Panel>
}
