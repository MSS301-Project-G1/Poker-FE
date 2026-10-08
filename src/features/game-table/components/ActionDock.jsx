import { useState } from 'react'

export default function ActionDock({ legalActions, callAmount, minRaiseTo, maxRaiseTo, pot, disabled, onAction }) {
  const canRaise = legalActions.includes('RAISE') && maxRaiseTo >= minRaiseTo
  const [amount, setAmount] = useState(Math.min(minRaiseTo, maxRaiseTo))
  const raiseAmount = Math.max(minRaiseTo, Math.min(maxRaiseTo, amount))
  return <section className="game-action-dock" aria-label="Poker actions">
    <div className="game-raise-controls">
      <span>RAISE TO</span>
      <div className="game-sizing">{[['Min', minRaiseTo], ['½ Pot', Math.max(minRaiseTo, Math.floor(pot / 2))], ['Pot', Math.max(minRaiseTo, pot)]].map(([label, value]) =>
        <button key={label} disabled={disabled || !canRaise} onClick={() => setAmount(Math.min(maxRaiseTo, value))}>{label}</button>)}</div>
      <input aria-label="Raise amount" type="range" min={minRaiseTo} max={Math.max(minRaiseTo, maxRaiseTo)} step="1" value={raiseAmount}
        disabled={disabled || !canRaise} onChange={event => setAmount(Number(event.target.value))} />
      <output>{raiseAmount.toLocaleString()}</output>
    </div>
    <div className="game-action-buttons">
      <button className="game-fold" disabled={disabled || !legalActions.includes('FOLD')} onClick={() => onAction('FOLD')}>FOLD<small>Leave this hand</small></button>
      <button className="game-call" disabled={disabled || !legalActions.some(action => action === 'CALL' || action === 'CHECK')}
        onClick={() => onAction(legalActions.includes('CHECK') ? 'CHECK' : 'CALL')}>
        {legalActions.includes('CHECK') ? 'CHECK' : 'CALL'}<small>{legalActions.includes('CHECK') ? 'No additional chips' : `${callAmount.toLocaleString()} chips`}</small></button>
      <button className="game-raise" disabled={disabled || !canRaise} onClick={() => onAction('RAISE', raiseAmount)}>RAISE<small>{raiseAmount.toLocaleString()} chips total</small></button>
      <button className="game-allin" disabled={disabled || !legalActions.includes('ALL_IN')} onClick={() => onAction('ALL_IN')}>ALL-IN<small>Commit remaining stack</small></button>
    </div>
  </section>
}
