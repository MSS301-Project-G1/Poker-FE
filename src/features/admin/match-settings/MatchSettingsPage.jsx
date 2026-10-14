import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { devIdentity } from '@/shared/lib/devIdentity'
import { fetchMatchSettings, updateMatchSettings } from './api/matchSettingsApi'
import './match-settings.css'

const emptyToken = async () => null
const fields = [ ['smallBlind', 'Small blind', 1, 1000000000000], ['bigBlind', 'Big blind', 2, 1000000000000], ['startingChips', 'Starting chips', 1, 1000000000000], ['turnTimeSeconds', 'Turn time (seconds)', 1, 300], ['minPlayers', 'Minimum players', 2, 10], ['maxPlayers', 'Maximum players', 2, 10] ]

export default function MatchSettingsPage({ getAccessToken = emptyToken }) {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(null)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  useEffect(() => {
    let disposed = false
    const abort = new AbortController()
    async function load() {
      try {
        const body = await fetchMatchSettings({ accessToken: await getAccessToken(), devUser: devIdentity(), signal: abort.signal })
        if (!disposed) { setSettings(body); setError('') }
      } catch (failure) { if (!disposed && failure.name !== 'AbortError') setError(failure.message) }
    }
    void load()
    return () => { disposed = true; abort.abort() }
  }, [version, getAccessToken])

  return <main className="match-settings-page"><header><div><p>GAME ADMINISTRATION</p><h1>Match settings</h1></div><button onClick={() => navigate(paths.lobby)}>Back to lobby</button></header>
    <p className="match-settings-intro">Configure the next match. Tables already running keep their original settings.</p>
    {error && <div role="alert" className="match-settings-error">{error}<button onClick={() => setVersion(value => value + 1)}>Retry</button></div>}
    {!settings && !error && <p role="status">Loading match settings…</p>}
    {settings?.length === 0 && <p>No match settings are available.</p>}
    <div className="match-settings-grid">{settings?.map(setting => <SettingsForm key={`${setting.mode}:${version}`} setting={setting} save={async payload => {
      const updated = await updateMatchSettings(setting.mode, payload, { accessToken: await getAccessToken(), devUser: devIdentity() })
      setSettings(current => current.map(item => item.mode === updated.mode ? updated : item))
    }} />)}</div>
  </main>
}

function SettingsForm({ setting, save }) {
  const [values, setValues] = useState(setting)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault()
    event.stopPropagation()
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
  return <form className="match-settings-card" aria-label={`${setting.mode} settings`} onSubmit={submit}><h2>{setting.mode}</h2><div>{fields.map(([key, label, min, max]) => <label key={key}>{label}<input required aria-label={`${setting.mode} ${label}`} type="number" min={min} max={max} step="1" value={values[key]} onChange={event => setValues(current => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}</div>
    {error && <p role="alert" className="match-settings-error">{error}</p>}{message && <p role="status" className="match-settings-success">{message}</p>}
    <button disabled={busy}>{busy ? 'Saving…' : `Save ${setting.mode}`}</button>
  </form>
}
