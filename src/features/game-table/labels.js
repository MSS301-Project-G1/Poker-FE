// Copy for the server enums shown on the table. Unknown values fall back to the raw name.
// Actions stay in English, like the action buttons.
export const actionLabels = { FOLD: 'Fold', CHECK: 'Check', CALL: 'Call', RAISE: 'Raise', ALL_IN: 'All-in' }

export const handLabels = {
  HIGH_CARD: 'Mậu thầu', ONE_PAIR: 'Một đôi', TWO_PAIR: 'Hai đôi', THREE_OF_A_KIND: 'Sám cô', STRAIGHT: 'Sảnh',
  FLUSH: 'Thùng', FULL_HOUSE: 'Cù lũ', FOUR_OF_A_KIND: 'Tứ quý', STRAIGHT_FLUSH: 'Thùng phá sảnh',
}

export const streetLabels = { PREFLOP: 'PRE-FLOP', FLOP: 'FLOP', TURN: 'TURN', RIVER: 'RIVER', HAND_FINISHED: 'HẾT VÁN', FINISHED: 'HẾT TRẬN' }

export const modeLabels = { NORMAL: 'CHƠI THƯỜNG', RANK: 'XẾP HẠNG' }

export const label = (labels, value) => labels[value] || value?.replaceAll('_', ' ')

export const playerName = (profile, accountId) => profile?.displayName || `Người chơi ${accountId.slice(-6)}`

// One line for the pot once a hand is settled, e.g. "GhostRider thắng 480 · Sảnh".
export function resultLine(snapshot, nameOf) {
  const { pots, winnings } = snapshot.distribution
  const winners = [...new Set(pots.flatMap(pot => pot.winnerSeats))]
  if (!winners.length) return null
  const seat = index => snapshot.seats.find(player => player.seatIndex === index)
  const who = index => seat(index).accountId === snapshot.accountId ? 'Bạn' : nameOf(seat(index))
  const won = winners.reduce((total, index) => total + (winnings[index] ?? 0), 0)
  const hand = seat(winners[0])?.handRank
  const head = winners.length === 1 ? `${who(winners[0])} thắng ${won.toLocaleString()}` : `${winners.map(who).join(', ')} chia pot`
  return `${head} · ${hand ? label(handLabels, hand.category) : 'đối thủ bỏ bài'}`
}
