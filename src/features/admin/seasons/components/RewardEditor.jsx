import { useState } from 'react'
import { TierBadge, tierOrder } from '@/features/ranking'
import { Button, Icon } from '@/shared/ui'
import { fromDraft, productName, toDraft } from '../format'
import Message from './Message'
import ProductSelect from './ProductSelect'
import styles from './RewardEditor.module.css'

// Coins and skins per tier for one season; saving replaces every reward of the season.
export default function RewardEditor({ season, products, onSave }) {
  const [draft, setDraft] = useState(() => toDraft(season.rewards))
  const [picked, setPicked] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const locked = season.status === 'ENDED'

  const update = (tier, change) => setDraft(current => ({ ...current, [tier]: { ...current[tier], ...change(current[tier]) } }))
  const addSkin = tier => {
    update(tier, row => ({ products: [...row.products, picked[tier]] }))
    setPicked(current => ({ ...current, [tier]: '' }))
  }
  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try { await onSave(fromDraft(draft)) } catch (failure) { setError(failure.message) } finally { setBusy(false) }
  }

  return <form className={styles.editor} aria-label={`Rewards of ${season.name}`} onSubmit={submit}>
    <div className={styles.head} aria-hidden="true"><span>Tier</span><span>Coins</span><span>Skins</span></div>
    <ol className={styles.rows}>
      {tierOrder.map(tier => <li key={tier} className={styles.row}>
        <TierBadge tier={tier} />
        <input className={styles.coins} type="number" min="1" step="1" inputMode="numeric" placeholder="—" aria-label={`${tier} coins`}
          value={draft[tier].coins} disabled={locked} onChange={event => update(tier, () => ({ coins: event.target.value }))} />
        <div className={styles.skins}>
          {draft[tier].products.map(id => <span key={id} className={styles.chip}>
            <Icon name="auto_awesome" className={styles.chipIcon} />{productName(products, id)}
            {!locked && <button type="button" className={styles.remove} aria-label={`Remove ${productName(products, id)} from ${tier}`}
              onClick={() => update(tier, row => ({ products: row.products.filter(product => product !== id) }))}><Icon name="close" /></button>}
          </span>)}
          {!locked && <div className={styles.add}>
            <ProductSelect products={products} value={picked[tier] || ''} exclude={draft[tier].products} label={`Skin for ${tier}`}
              onChange={id => setPicked(current => ({ ...current, [tier]: id }))} />
            <Button disabled={!picked[tier] || draft[tier].products.includes(picked[tier])} onClick={() => addSkin(tier)}>Add</Button>
          </div>}
        </div>
      </li>)}
    </ol>
    {locked
      ? <Message tone="notice">Rewards of an ended season are locked: players claim what was set when it closed.</Message>
      : <footer className={styles.footer}>
        {error && <Message tone="error">{error}</Message>}
        <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save rewards'}</Button>
      </footer>}
  </form>
}
