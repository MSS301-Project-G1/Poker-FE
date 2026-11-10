import { cardFlipMillis } from '@/shared/skin'

// Plans the table's animations for one snapshot by comparing it with the snapshot shown before it.
// Every time is in milliseconds after the new snapshot arrived (snapshot.receivedAt).

export const timing = {
  dealStep: 90,
  dealFlight: 320,
  flip: cardFlipMillis,
  holeCardStagger: 90,
  flopStagger: 140,
  streetGap: 900,
  betsToPot: 380,
  revealGap: 350,
  revealStagger: 250,
  resultGap: 450,
  payDelay: 400,
  payFlight: 700,
  resultDialog: 2600,
  // How long an equipped dealer keeps the deal or flip pose after the cards land, so it reads as a gesture.
  dealerPoseHold: 700,
}

const flopCards = 3
const actionSounds = { FOLD: 'fold', CHECK: 'check', CALL: 'chip', RAISE: 'chip', ALL_IN: 'chip' }
const ended = street => street === 'HAND_FINISHED' || street === 'FINISHED'

/**
 * @returns {{ key: string, startedAt: number, deal: Record<number, number[]> | null, board: number[],
 *   reveals: Record<number, number[]>, betsToPot: boolean, pots: object[], sounds: { name: string, at: number }[],
 *   milestones: { result: number | null, pay: number | null, paid: number | null, dialog: number | null,
 *     dealt: number | null, flipped: number | null } }}
 *   A milestone is null when it does not apply, 0 when it is already reached, otherwise when it is reached.
 *   pay starts the chips flying to the winners; paid is when they land. dealt and flipped end the dealer's
 *   deal and flip poses: the hole cards or the new board cards have landed, plus a short hold.
 */
export function planTransition(previous, next) {
  const plan = {
    key: `${next.tableId}:${next.actionSequence}:${next.street}`, startedAt: next.receivedAt, deal: null, board: [], reveals: {},
    betsToPot: false, pots: next.distribution?.pots ?? [], sounds: [],
    milestones: { result: next.distribution ? 0 : null, pay: null, paid: null, dialog: next.street === 'FINISHED' ? 0 : null, dealt: null, flipped: null },
  }
  // The first snapshot, or one from another table, shows its end state at once.
  if (!previous || previous.tableId !== next.tableId) return plan
  const viewer = next.seats.find(seat => seat.accountId === next.accountId)
  let done
  if (next.handNumber !== previous.handNumber) {
    plan.deal = dealDelays(next)
    plan.sounds.push({ name: 'shuffle', at: 0 }, ...Object.values(plan.deal).flat().map(at => ({ name: 'card', at })))
    // Your cards land face down and turn over.
    if (viewer && plan.deal[viewer.seatIndex]) plan.reveals[viewer.seatIndex] = plan.deal[viewer.seatIndex].map(at => at + timing.dealFlight)
    done = Math.max(0, ...Object.values(plan.deal).flat()) + timing.dealFlight
    plan.milestones.dealt = done + timing.dealerPoseHold
  } else {
    done = sameHand(previous, next, plan, viewer)
  }
  if (next.legalActions.length && (plan.deal || !previous.legalActions.length)) plan.sounds.push({ name: 'turn', at: done })
  return plan
}

function sameHand(previous, next, plan, viewer) {
  const acted = next.actionSequence > previous.actionSequence && next.seats.find(seat => seat.seatIndex === previous.actorSeat)
  if (acted && actionSounds[acted.lastAction]) plan.sounds.push({ name: actionSounds[acted.lastAction], at: 0 })
  // A street ends: the bets slide into the pot before the next cards come.
  plan.betsToPot = next.street !== previous.street && !ended(previous.street) && previous.seats.some(seat => seat.streetBet > 0)
  let at = plan.betsToPot ? timing.betsToPot : 0
  let done = at
  // An all-in runs several streets out at once; show them flop, turn and river in turn.
  let street = null
  for (let index = previous.board.length; index < next.board.length; index++) {
    const cardStreet = index < flopCards ? 0 : index - flopCards + 1
    if (street !== null) at += cardStreet === street ? timing.flopStagger : timing.streetGap
    street = cardStreet
    plan.board[index] = at
    plan.sounds.push({ name: 'card', at })
    done = at + timing.flip
  }
  if (plan.board.length) plan.milestones.flipped = done + timing.dealerPoseHold
  const shown = seat => previous.seats.find(old => old.seatIndex === seat.seatIndex)?.cards.length > 0
  const revealed = next.seats.filter(seat => seat.accountId !== next.accountId && seat.cards.length && !shown(seat))
  revealed.forEach((seat, order) => {
    const start = done + timing.revealGap + order * timing.revealStagger
    plan.reveals[seat.seatIndex] = seat.cards.map((_, card) => start + card * timing.holeCardStagger)
    plan.sounds.push({ name: 'card', at: start })
  })
  if (revealed.length) done += timing.revealGap + (revealed.length - 1) * timing.revealStagger + timing.holeCardStagger + timing.flip
  if (next.distribution && !previous.distribution) {
    const result = done + timing.resultGap
    const pay = result + timing.payDelay
    const paid = pay + timing.payFlight
    Object.assign(plan.milestones, { result, pay, paid, dialog: next.street === 'FINISHED' ? paid + timing.resultDialog : null })
    const won = viewer && next.distribution.pots.some(pot => pot.winnerSeats.includes(viewer.seatIndex))
    plan.sounds.push(won ? { name: 'win', at: result } : { name: 'chip', at: pay })
  } else if (next.street === 'FINISHED' && previous.street !== 'FINISHED') {
    // The hand was already settled (for example the last opponent left during the pause).
    plan.milestones.dialog = timing.resultDialog
  }
  return done
}

// Two rounds, one card at a time, starting left of the dealer.
function dealDelays(next) {
  const seats = next.seats.length
  const order = next.seats.filter(seat => seat.holeCardCount > 0)
    .sort((a, b) => (a.seatIndex - next.dealerSeat - 1 + seats) % seats - (b.seatIndex - next.dealerSeat - 1 + seats) % seats)
  return Object.fromEntries(order.map((seat, position) => [seat.seatIndex,
    Array.from({ length: seat.holeCardCount }, (_, round) => (round * order.length + position) * timing.dealStep)]))
}
