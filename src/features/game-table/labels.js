// Copy for the server enums shown on the table. Unknown values fall back to the raw name.
// Actions stay in English, like the action buttons.
export const actionLabels = { FOLD: 'Fold', CHECK: 'Check', CALL: 'Call', RAISE: 'Raise', ALL_IN: 'All-in' }

export const handLabels = {
  HIGH_CARD: 'High card', ONE_PAIR: 'One pair', TWO_PAIR: 'Two pair', THREE_OF_A_KIND: 'Three of a kind', STRAIGHT: 'Straight',
  FLUSH: 'Flush', FULL_HOUSE: 'Full house', FOUR_OF_A_KIND: 'Four of a kind', STRAIGHT_FLUSH: 'Straight flush',
}

export const streetLabels = { PREFLOP: 'PRE-FLOP', FLOP: 'FLOP', TURN: 'TURN', RIVER: 'RIVER', HAND_FINISHED: 'HAND OVER', FINISHED: 'MATCH OVER' }

export const modeLabels = { NORMAL: 'CASUAL', RANK: 'RANKED' }

export const label = (labels, value) => labels[value] || value?.replaceAll('_', ' ')

export const playerName = (profile, accountId) => profile?.displayName || `Player ${accountId.slice(-6)}`

// One line for the pot once a hand is settled, e.g. "GhostRider thắng 480 · Sảnh".
export function resultLine(snapshot, nameOf) {
  const { pots, winnings } = snapshot.distribution
  const winners = [...new Set(pots.flatMap(pot => pot.winnerSeats))]
  if (!winners.length) return null
  const seat = index => snapshot.seats.find(player => player.seatIndex === index)
  const who = index => seat(index).accountId === snapshot.accountId ? 'You' : nameOf(seat(index))
  const won = winners.reduce((total, index) => total + (winnings[index] ?? 0), 0)
  const hand = seat(winners[0])?.handRank
  const head = winners.length === 1 ? `${who(winners[0])} wins ${won.toLocaleString()}` : `${winners.map(who).join(', ')} chia pot`
  return `${head} · ${hand ? label(handLabels, hand.category) : 'opponents folded'}`
}
