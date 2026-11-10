import { useLayoutEffect, useRef, useState } from 'react'
import { dealCards, flyChips, measureBets } from './flights'
import { planTransition } from './timeline'

// A player leaving out of turn can end the hand or the match without a new action sequence, so the street counts too.
const sameStep = (a, b) => a.tableId === b.tableId && a.actionSequence === b.actionSequence && a.street === b.street

/**
 * Turns each new snapshot into a short show: dealing, board reveals, showdown, paying the pot and sounds.
 * The table always plays from the real snapshot; this only delays how parts of it appear.
 */
export function useTablePresentation(snapshot, { play, tableRef, layerRef }) {
  const [tracked, setTracked] = useState({ snapshot: null, plan: null })
  // A periodic sync re-sends the same step; keep its show running instead of skipping to the end.
  if (snapshot && tracked.snapshot !== snapshot) {
    setTracked({ snapshot, plan: tracked.snapshot && sameStep(tracked.snapshot, snapshot) ? tracked.plan : planTransition(tracked.snapshot, snapshot) })
  }
  const plan = tracked.snapshot === snapshot ? tracked.plan : null
  const [reached, setReached] = useState({ key: null })
  const betRects = useRef([])

  // Layout effects run before paint, so dealt cards never flash in their final place first.
  useLayoutEffect(() => {
    if (!plan) return undefined
    const elapsed = Date.now() - plan.startedAt
    const timers = []
    const later = (at, run) => timers.push(window.setTimeout(run, Math.max(0, at - elapsed)))
    for (const [name, at] of Object.entries(plan.milestones)) {
      if (at > 0) later(at, () => setReached(current => ({ ...(current.key === plan.key ? current : { key: plan.key }), [name]: true })))
    }
    // Sounds already long past (a slow reconnect) stay silent.
    for (const sound of plan.sounds) if (sound.at >= elapsed - 150) later(sound.at, () => play(sound.name))
    const table = tableRef.current
    if (plan.deal) dealCards(table, plan.deal, elapsed)
    if (plan.betsToPot) flyChips(layerRef.current, betRects.current, table?.querySelector('[data-pot]'))
    if (plan.milestones.pay > 0) {
      later(plan.milestones.pay, () => {
        const pot = table?.querySelector('[data-pot]')
        if (!pot) return
        plan.pots.forEach((award, index) => award.winnerSeats.forEach(seat =>
          flyChips(layerRef.current, [pot.getBoundingClientRect()], table.querySelector(`[data-seat="${seat}"] [data-plate]`), index * 250)))
      })
    }
    return () => timers.forEach(window.clearTimeout)
  }, [plan, play, tableRef, layerRef])

  // Declared after the effect above, so it still reads the previous street's bets when a street ends.
  useLayoutEffect(() => { betRects.current = measureBets(tableRef.current) })

  const isReached = name => plan?.milestones[name] === 0 || (reached.key === plan?.key && reached[name] === true)
  return {
    boardDelays: plan?.board ?? [],
    reveals: plan?.reveals ?? {},
    resultShown: isReached('result'),
    // Winnings join the stacks only when the chips land.
    paying: plan?.milestones.paid > 0 && !isReached('paid'),
    dialogShown: isReached('dialog'),
    // An equipped dealer deals the hole cards, turns the board, then presents the pot.
    dealerPose: isReached('result') && snapshot?.distribution ? 'win'
      : plan?.deal && !isReached('dealt') ? 'deal'
        : plan?.board.length && !isReached('flipped') ? 'flip' : 'idle',
  }
}
