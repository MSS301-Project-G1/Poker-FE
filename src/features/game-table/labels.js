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
