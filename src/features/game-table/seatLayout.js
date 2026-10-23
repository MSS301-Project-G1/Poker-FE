// Rail positions in play order (clockwise), starting at the bottom centre where the viewer sits.
const slotsByCount = {
  2: ['bottom', 'top'],
  3: ['bottom', 'topLeft', 'topRight'],
  4: ['bottom', 'left', 'top', 'right'],
  5: ['bottom', 'left', 'topLeft', 'topRight', 'right'],
  6: ['bottom', 'left', 'topLeft', 'topRight', 'right', 'bottomRight'],
  7: ['bottom', 'bottomLeft', 'left', 'topLeft', 'topRight', 'right', 'bottomRight'],
  8: ['bottom', 'bottomLeft', 'left', 'topLeft', 'top', 'topRight', 'right', 'bottomRight'],
}

/** Rotates the seats so the viewer always sits at the bottom; a spectator sees seat 0 there. */
export function placeSeats(seats, viewerId) {
  const ordered = [...seats].sort((a, b) => a.seatIndex - b.seatIndex)
  const start = Math.max(0, ordered.findIndex(seat => seat.accountId === viewerId))
  const slots = slotsByCount[ordered.length] || slotsByCount[8]
  return ordered.map((_, offset) => ({ player: ordered[(start + offset) % ordered.length], slot: slots[offset] }))
}
