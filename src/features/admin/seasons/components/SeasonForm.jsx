import { useState } from 'react'
import { Button } from '@/shared/ui'
import { addDays, fromVietnamInput, toVietnamInput } from '../format'
import Message from './Message'
import styles from './SeasonForm.module.css'

const SEASON_DAYS = 90

/** Starts where the newest season ends (or tomorrow) and lasts about three months. */
function initialValues(seasons) {
  const newest = seasons[0]
  const start = newest ? newest.endAt : addDays(new Date().toISOString(), 1)
  return { name: '', startAt: toVietnamInput(start), endAt: toVietnamInput(addDays(start, SEASON_DAYS)), resetPercent: '50', copyFrom: newest?.id || '' }
}

// A new UPCOMING season; tier rewards can be copied from an existing season and edited afterwards.
export default function SeasonForm({ seasons, onCreate, onCancel }) {
  const [values, setValues] = useState(() => initialValues(seasons))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = key => event => setValues(current => ({ ...current, [key]: event.target.value }))

  const submit = async event => {
    event.preventDefault()
    if (values.endAt <= values.startAt) { setError('The season must end after it starts.'); return }
    const source = seasons.find(season => season.id === values.copyFrom)
    setBusy(true)
    setError('')
    try {
      await onCreate({
        name: values.name.trim(), startAt: fromVietnamInput(values.startAt), endAt: fromVietnamInput(values.endAt),
        resetPercent: Number(values.resetPercent),
        rewards: (source?.rewards || []).map(({ tier, rewardType, amount, productId }) =>
          rewardType === 'COIN' ? { tier, rewardType, amount } : { tier, rewardType, productId }),
      })
    } catch (failure) {
      setError(failure.message)
      setBusy(false)
    }
  }

  return <form className={styles.form} aria-label="New season" onSubmit={submit}>
    <label className={styles.field}>Name
      <input required maxLength={100} value={values.name} onChange={set('name')} placeholder="Season 2" />
    </label>
    <div className={styles.pair}>
      <label className={styles.field}>Starts (Vietnam time)
        <input required type="datetime-local" value={values.startAt} onChange={set('startAt')} />
      </label>
      <label className={styles.field}>Ends (Vietnam time)
        <input required type="datetime-local" value={values.endAt} onChange={set('endAt')} />
      </label>
    </div>
    <div className={styles.pair}>
      <label className={styles.field}>Elo kept at the end (%)
        <input required type="number" min="0" max="100" step="1" value={values.resetPercent} onChange={set('resetPercent')} />
      </label>
      <label className={styles.field}>Tier rewards
        <select value={values.copyFrom} onChange={set('copyFrom')}>
          <option value="">Start without rewards</option>
          {seasons.map(season => <option key={season.id} value={season.id}>Copy from {season.name}</option>)}
        </select>
      </label>
    </div>
    <p className={styles.hint}>The season starts by itself once the current one closes. Rewards stay editable until it ends.</p>
    {error && <Message tone="error">{error}</Message>}
    <footer className={styles.footer}>
      <Button onClick={onCancel}>Cancel</Button>
      <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create season'}</Button>
    </footer>
  </form>
}
