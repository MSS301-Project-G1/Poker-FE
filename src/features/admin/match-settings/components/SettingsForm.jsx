import { useState } from 'react'
import { Button } from '@/shared/ui'
import styles from './SettingsForm.module.css'

// [field, label, min, max]
const fields = [
  ['smallBlind', 'Small blind', 1, 1000000000000],
  ['bigBlind', 'Big blind', 2, 1000000000000],
  ['startingChips', 'Starting chips', 1, 1000000000000],
  ['turnTimeSeconds', 'Turn time (seconds)', 1, 300],
  ['minPlayers', 'Minimum players', 2, 10],
  ['maxPlayers', 'Maximum players', 2, 10],
]

export default function SettingsForm({ setting, save }) {
  const [values, setValues] = useState(setting)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault()
    if (values.bigBlind <= values.smallBlind || values.startingChips < values.bigBlind || values.minPlayers > values.maxPlayers) {
      setError('Big blind must exceed small blind. Starting chips must cover big blind, and minimum players cannot exceed maximum players.')
      return
    }
    setBusy(true); setError(''); setMessage('')
    try {
      await save({ settings: { smallBlind: values.smallBlind, bigBlind: values.bigBlind, startingChips: values.startingChips, turnTimeSeconds: values.turnTimeSeconds }, minPlayers: values.minPlayers, maxPlayers: values.maxPlayers })
      setMessage('Saved. Future tables will use these settings.')
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }
  return <form className={styles.card} aria-label={`${setting.mode} settings`} onSubmit={submit}><h2>{setting.mode}</h2>
    <div className={styles.fields}>{fields.map(([key, label, min, max]) => <label key={key}>{label}<input required aria-label={`${setting.mode} ${label}`} type="number" min={min} max={max} step="1" value={values[key]} onChange={event => setValues(current => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}</div>
    {error && <p role="alert" className={styles.error}>{error}</p>}{message && <p role="status" className={styles.success}>{message}</p>}
    <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Saving…' : `Save ${setting.mode}`}</Button>
  </form>
}
