import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { devIdentity } from '@/shared/lib/devIdentity'
import { Button, Eyebrow } from '@/shared/ui'
import { fetchMatchSettings, updateMatchSettings } from './api/matchSettingsApi'
import SettingsForm from './components/SettingsForm'
import styles from './MatchSettingsPage.module.css'

const emptyToken = async () => null

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

  return <main className={styles.page}><header className={styles.header}><div><Eyebrow as="p">GAME ADMINISTRATION</Eyebrow><h1>Match settings</h1></div><Button variant="primary" onClick={() => navigate(paths.lobby)}>Back to lobby</Button></header>
    <p className={styles.intro}>Configure the next match. Tables already running keep their original settings.</p>
    {error && <div role="alert" className={styles.error}>{error}<Button variant="primary" onClick={() => setVersion(value => value + 1)}>Retry</Button></div>}
    {!settings && !error && <p role="status">Loading match settings…</p>}
    {settings?.length === 0 && <p>No match settings are available.</p>}
    <div className={styles.grid}>{settings?.map(setting => <SettingsForm key={`${setting.mode}:${version}`} setting={setting} save={async payload => {
      const updated = await updateMatchSettings(setting.mode, payload, { accessToken: await getAccessToken(), devUser: devIdentity() })
      setSettings(current => current.map(item => item.mode === updated.mode ? updated : item))
    }} />)}</div>
  </main>
}
