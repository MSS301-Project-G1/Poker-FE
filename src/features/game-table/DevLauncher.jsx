import { useState } from 'react'
import { gameRequest } from './gameApi'

export default function DevLauncher({ navigate }) {
  const [humans, setHumans] = useState(1)
  const [bots, setBots] = useState(5)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [table, setTable] = useState(null)

  const create = async event => {
    event.preventDefault()
    event.stopPropagation()
    setBusy(true)
    setError('')
    try {
      const created = await gameRequest(`/dev/tables?humans=${humans}&bots=${bots}`, { method: 'POST' })
      sessionStorage.setItem('poker.game.devUser', created.humanIds[0])
      setTable(created)
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <section className="game-dev-panel" aria-label="Local game tools"><span className="game-eyebrow">LOCAL DEVELOPMENT</span><h2>Play against bots</h2>
    <p>Create a local table to test actions, reconnect and side pots.</p>
    {error && <p className="game-error" role="alert">{error}</p>}
    {!table ? <form onSubmit={create}><label>Humans<input aria-label="Human players" type="number" min="1" max="6" value={humans} onChange={event => setHumans(Number(event.target.value))} /></label>
      <label>Bots<input aria-label="Bot players" type="number" min="0" max="5" value={bots} onChange={event => setBots(Number(event.target.value))} /></label>
      <button className="game-primary" disabled={busy || humans + bots < 2 || humans + bots > 6}>{busy ? 'Creating…' : 'Create local table'}</button></form>
      : <div className="game-dev-links"><button className="game-primary" onClick={() => navigate(`/table/${table.tableId}?devUser=${table.humanIds[0]}`)}>Join table</button>
        {table.humanIds.map((id, index) => <a key={id} href={`/table/${table.tableId}?devUser=${id}`} target="_blank" rel="noreferrer">Open human {index + 1} in another tab ↗</a>)}</div>}
  </section>
}
