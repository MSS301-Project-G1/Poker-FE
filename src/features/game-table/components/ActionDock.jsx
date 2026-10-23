import { useState } from 'react'
import { Icon } from '@/shared/ui'
import styles from './ActionDock.module.css'

// All-in has no button of its own: the All-in preset, or a stack too short to raise, turns Raise into All-in.
export default function ActionDock({ legalActions, callAmount, minRaiseTo, maxRaiseTo, pot, disabled, onAction }) {
  const canRaise = legalActions.includes('RAISE') && maxRaiseTo >= minRaiseTo
  const canCheck = legalActions.includes('CHECK')
  const [amount, setAmount] = useState(Math.min(minRaiseTo, maxRaiseTo))
  const raiseAmount = Math.max(minRaiseTo, Math.min(maxRaiseTo, amount))
  const allIn = legalActions.includes('ALL_IN') && (!canRaise || raiseAmount >= maxRaiseTo)
  const presets = [['Min', minRaiseTo], ['½ Pot', Math.max(minRaiseTo, Math.floor(pot / 2))], ['Pot', Math.max(minRaiseTo, pot)], ['All-in', maxRaiseTo]]
  return <section className={styles.dock} aria-label="Poker actions">
    <div className={styles.raiseControls}>
      <div className={styles.sizing}>{presets.map(([name, value]) =>
        <button key={name} className={name === 'All-in' ? styles.allinPreset : undefined} disabled={disabled || !canRaise}
          onClick={() => setAmount(Math.min(maxRaiseTo, value))}>{name}</button>)}</div>
      <input aria-label="Raise amount" type="range" min={minRaiseTo} max={Math.max(minRaiseTo, maxRaiseTo)} step="1" value={raiseAmount}
        disabled={disabled || !canRaise} onChange={event => setAmount(Number(event.target.value))} />
      <output><Icon name="toll" />{raiseAmount.toLocaleString()}</output>
    </div>
    <div className={styles.actions}>
      <button className={styles.fold} disabled={disabled || !legalActions.includes('FOLD')} onClick={() => onAction('FOLD')}>FOLD<small>Leave this hand</small></button>
      <button className={styles.call} disabled={disabled || !(canCheck || legalActions.includes('CALL'))} onClick={() => onAction(canCheck ? 'CHECK' : 'CALL')}>
        {canCheck ? 'CHECK' : 'CALL'}<small>{canCheck ? 'No additional chips' : `${callAmount.toLocaleString()} chips`}</small></button>
      <button className={`${styles.raise} ${allIn ? styles.allin : ''}`} disabled={disabled || !(canRaise || allIn)}
        onClick={() => allIn ? onAction('ALL_IN') : onAction('RAISE', raiseAmount)}>
        <span>{allIn ? 'ALL-IN' : 'RAISE'}<Icon name="bolt" /></span><small>{allIn && !canRaise ? 'Commit remaining stack' : `${raiseAmount.toLocaleString()} chips total`}</small></button>
    </div>
  </section>
}
