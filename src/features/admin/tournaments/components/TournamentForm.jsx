import { useState } from 'react'
import { Button } from '@/shared/ui'
import { fromVietnamInput, toVietnamInput } from '../format'
import Message from './Message'
import ProductSelect from './ProductSelect'
import styles from './TournamentForm.module.css'

const HOUR = 60 * 60 * 1000
// competition-service draws tables of eight and sends the top two of each to an eight-seat final.
const MAX_SLOTS = 32

/** A full hour at least two hours ahead, so an Elite tournament leaves time for its invitations. */
function initialValues() {
  const start = new Date(Math.ceil((Date.now() + 2 * HOUR) / HOUR) * HOUR).toISOString()
  return { name: '', type: 'OPEN', startAt: toVietnamInput(start), entryFee: '100', slots: String(MAX_SLOTS), rewardCoins: '0', rewardProductId: '' }
}

const types = [
  { id: 'OPEN', label: 'Open', hint: 'Anyone registers until the start, first come first served. Entry fees fill the prize pool.' },
  { id: 'ELITE', label: 'Elite', hint: 'Free. The top of the leaderboard is invited about 30 minutes before the start, so it must start at least that late.' },
]

// Schedules a tournament: type, start, places, entry fee and the extra coins and skin for the podium.
export default function TournamentForm({ products, onCreate }) {
  const [values, setValues] = useState(initialValues)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const elite = values.type === 'ELITE'
  const set = key => event => setValues(current => ({ ...current, [key]: event.target.value }))

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onCreate({
        name: values.name.trim(), type: values.type, startAt: fromVietnamInput(values.startAt),
        entryFee: elite ? 0 : Number(values.entryFee), slots: Number(values.slots),
        rewardCoins: Number(values.rewardCoins) || 0, rewardProductId: values.rewardProductId || null,
      })
      setValues(initialValues())
    } catch (failure) {
      setError(failure.message)
    } finally { setBusy(false) }
  }

  return <form className={styles.form} aria-label="New tournament" onSubmit={submit}>
    <fieldset className={styles.types}>
      <legend className={styles.legend}>Type</legend>
      {types.map(type => <label key={type.id} className={`${styles.type} ${values.type === type.id ? styles.chosen : ''}`}>
        <input type="radio" name="type" value={type.id} checked={values.type === type.id} onChange={set('type')} />{type.label}
      </label>)}
    </fieldset>
    <p className={styles.hint}>{types.find(type => type.id === values.type).hint}</p>
    <label className={styles.field}>Name
      <input required maxLength={100} value={values.name} onChange={set('name')} placeholder={elite ? 'Elite Night' : 'Weekend Open'} />
    </label>
    <div className={styles.pair}>
      <label className={styles.field}>Starts (Vietnam time)
        <input required type="datetime-local" value={values.startAt} onChange={set('startAt')} />
      </label>
      <label className={styles.field}>Places
        <input required type="number" min="4" max={MAX_SLOTS} step="1" value={values.slots} onChange={set('slots')} />
      </label>
    </div>
    <div className={styles.pair}>
      <label className={styles.field}>Entry fee (coins)
        <input required type="number" min="0" step="1" value={elite ? '0' : values.entryFee} disabled={elite} onChange={set('entryFee')} />
      </label>
      <label className={styles.field}>Bonus coins
        <input type="number" min="0" step="1" value={values.rewardCoins} onChange={set('rewardCoins')} />
      </label>
    </div>
    <label className={styles.field}>Champion skin (optional)
      <ProductSelect products={products} value={values.rewardProductId} label="Champion skin"
        onChange={id => setValues(current => ({ ...current, rewardProductId: id }))} />
    </label>
    <p className={styles.hint}>The top three of the final share the entry fees and bonus coins; the champion also receives the skin.</p>
    {error && <Message tone="error">{error}</Message>}
    <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Scheduling…' : 'Schedule tournament'}</Button>
  </form>
}
