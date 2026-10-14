import { useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { rememberDevIdentity } from '@/shared/lib/devIdentity'
import { Button, Eyebrow } from '@/shared/ui'
import { createDevTable } from '../api/gameApi'
import styles from './DevLauncher.module.css'

// Local development only (env.gameDevMode): creates a table with bots and per-human links.
export default function DevLauncher() {
  const navigate = useNavigate()
  const [humans, setHumans] = useState(1)
  const [bots, setBots] = useState(5)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [table, setTable] = useState(null)

  const create = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const created = await createDevTable({ humans, bots })
      rememberDevIdentity(created.humanIds[0])
      setTable(created)
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <section className={styles.panel} aria-label="Local game tools"><Eyebrow>LOCAL DEVELOPMENT</Eyebrow><h2>Play against bots</h2>
    <p>Create a local table to test actions, reconnect and side pots.</p>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {!table ? <form className={styles.form} onSubmit={create}><label>Humans<input aria-label="Human players" type="number" min="1" max="6" value={humans} onChange={event => setHumans(Number(event.target.value))} /></label>
      <label>Bots<input aria-label="Bot players" type="number" min="0" max="5" value={bots} onChange={event => setBots(Number(event.target.value))} /></label>
      <Button variant="primary" type="submit" className={styles.fullWidth} disabled={busy || humans + bots < 2 || humans + bots > 6}>{busy ? 'Creating…' : 'Create local table'}</Button></form>
      : <div className={styles.links}><Button variant="primary" onClick={() => navigate(`${paths.tableById(table.tableId)}?devUser=${table.humanIds[0]}`)}>Join table</Button>
        {table.humanIds.map((id, index) => <a key={id} href={`${paths.tableById(table.tableId)}?devUser=${id}`} target="_blank" rel="noreferrer">Open human {index + 1} in another tab ↗</a>)}</div>}
  </section>
}
