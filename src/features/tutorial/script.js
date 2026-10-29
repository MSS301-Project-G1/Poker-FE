// The scripted lesson: two hands against two bots. The chips add up from step to step; only the action a step
// expects is enabled, so the player learns one button at a time. Card codes: rank then suit letter, e.g. AS, 10H.
const rankCodes = { 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE', 6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE', 10: 'TEN', J: 'JACK', Q: 'QUEEN', K: 'KING', A: 'ACE' }
const suitCodes = { S: 'SPADES', H: 'HEARTS', D: 'DIAMONDS', C: 'CLUBS' }

export const card = code => ({ rank: rankCodes[code.slice(0, -1)], suit: suitCodes[code.slice(-1)] })

export const YOU = 0
const MAI = 1
const KHOA = 2

/** Seat 0 is the player; the bots sit at the top of the rail in seat order. */
export const seatSlots = ['bottom', 'topLeft', 'topRight']

export const bots = { [MAI]: { id: 'tutorial-bot-mai', displayName: 'Mai (bot)' }, [KHOA]: { id: 'tutorial-bot-khoa', displayName: 'Khoa (bot)' } }

// First hand: the player holds the button with A♠ K♠, Mai posts the small blind and Khoa the big blind.
const firstHand = { dealer: YOU, smallBlind: MAI, bigBlind: KHOA }
// Second hand: the button moves to Mai, so Khoa posts the small blind and the player the big blind.
const secondHand = { dealer: MAI, smallBlind: KHOA, bigBlind: YOU }
const flop = ['KH', '7S', '2S']

export const steps = [
  {
    ...firstHand, street: 'PREFLOP', board: [], pot: 30,
    seats: [{ chips: 1000, cards: ['AS', 'KS'] }, { chips: 990, bet: 10 }, { chips: 980, bet: 20 }],
    title: 'Chào mừng tới bàn tập',
    text: 'Đây là một ván Texas Hold’em dựng sẵn với hai bot. Mỗi người có 2 lá bài riêng, bàn lần lượt mở 5 lá chung; ai ghép được 5 lá mạnh nhất từ 7 lá sẽ thắng pot. Chip ở đây chỉ để tập.',
  },
  {
    ...firstHand, street: 'PREFLOP', board: [], pot: 30,
    seats: [{ chips: 1000, cards: ['AS', 'KS'] }, { chips: 990, bet: 10 }, { chips: 980, bet: 20 }],
    title: 'Blind và nút D',
    text: 'Mai đặt small blind (SB) 10, Khoa đặt big blind (BB) 20: đó là tiền cược bắt buộc để ván nào cũng có pot. Nút D (dealer) đang ở chỗ bạn, vòng sau nút sẽ chuyển sang người kế tiếp.',
  },
  {
    ...firstHand, street: 'PREFLOP', board: [], pot: 30, actor: YOU,
    seats: [{ chips: 1000, cards: ['AS', 'KS'] }, { chips: 990, bet: 10 }, { chips: 980, bet: 20 }],
    expect: 'RAISE', dock: { callAmount: 20, minRaiseTo: 60, maxRaiseTo: 60 },
    title: 'RAISE với bài mạnh',
    text: 'Bạn cầm A♠ K♠, một trong những cặp bài khởi đầu mạnh nhất. Muốn chơi tiếp phải bỏ vào ít nhất bằng cược lớn nhất (CALL 20). Bài mạnh thì nên nâng cược để pot lớn hơn: bấm RAISE lên 60.',
  },
  {
    ...firstHand, street: 'PREFLOP', board: [], pot: 130,
    seats: [{ chips: 940, bet: 60, action: 'RAISE', cards: ['AS', 'KS'] }, { chips: 990, bet: 10, action: 'FOLD', folded: true },
      { chips: 940, bet: 60, action: 'CALL' }],
    title: 'Đối thủ trả lời',
    text: 'Mai bỏ bài (FOLD) và mất 10 đã đặt. Khoa theo (CALL) thêm 40 cho bằng 60. Một vòng cược kết thúc khi mọi người còn lại đã bỏ vào bằng nhau.',
  },
  {
    ...firstHand, street: 'FLOP', board: flop, pot: 130, actor: YOU,
    seats: [{ chips: 940, cards: ['AS', 'KS'] }, { chips: 990, action: 'FOLD', folded: true }, { chips: 940, action: 'CHECK' }],
    expect: 'CHECK', dock: { callAmount: 0, minRaiseTo: 20, maxRaiseTo: 20 },
    title: 'Flop: CHECK',
    text: 'Flop mở 3 lá K♥ 7♠ 2♠. Bạn có đôi K, đôi lớn nhất trên bàn, và chỉ thiếu 1 lá ♠ nữa là thành thùng. Khoa CHECK (không cược). Khi chưa ai cược, bạn cũng CHECK được để xem lá tiếp theo mà không tốn chip: bấm CHECK.',
  },
  {
    ...firstHand, street: 'TURN', board: [...flop, '9D'], pot: 180, actor: YOU,
    seats: [{ chips: 940, action: 'CHECK', cards: ['AS', 'KS'] }, { chips: 990, action: 'FOLD', folded: true }, { chips: 890, bet: 50, action: 'RAISE' }],
    expect: 'CALL', dock: { callAmount: 50, minRaiseTo: 100, maxRaiseTo: 100 },
    title: 'Turn: CALL',
    text: 'Turn mở lá 9♦ và Khoa cược 50. Giờ bạn phải CALL 50 để đi tiếp, nếu FOLD thì mất mọi chip đã bỏ vào pot. Bài bạn vẫn tốt và còn cơ hội ra thùng: bấm CALL.',
  },
  {
    ...firstHand, street: 'RIVER', board: [...flop, '9D', 'QS'], pot: 230, actor: YOU,
    seats: [{ chips: 890, cards: ['AS', 'KS'] }, { chips: 990, action: 'FOLD', folded: true }, { chips: 890, action: 'CHECK' }],
    expect: 'RAISE', dock: { callAmount: 0, minRaiseTo: 150, maxRaiseTo: 150 },
    title: 'River: cược khi bài mạnh',
    text: 'Lá cuối là Q♠: bạn có THÙNG gồm A♠ K♠ Q♠ 7♠ 2♠. Khoa lại CHECK. Khi chắc mình đang thắng, hãy cược để đối thủ bỏ thêm chip vào pot: bấm RAISE 150.',
  },
  {
    ...firstHand, street: 'HAND_FINISHED', board: [...flop, '9D', 'QS'], pot: 530, winner: YOU,
    result: 'Bạn thắng 530 · Thùng', distribution: { pots: [{ amount: 530, winnerSeats: [YOU] }], winnings: { [YOU]: 530 } },
    seats: [{ chips: 1270, action: 'RAISE', cards: ['AS', 'KS'], hand: 'FLUSH' }, { chips: 990, action: 'FOLD', folded: true },
      { chips: 740, action: 'CALL', cards: ['KD', 'QD'], hand: 'TWO_PAIR' }],
    title: 'Lật bài',
    text: 'Khoa theo 150 rồi hai bên lật bài. Khoa có hai đôi K và Q, thùng của bạn mạnh hơn nên bạn ăn cả pot 530. Thứ tự các tay bài có ở nút Hand rankings trên cùng.',
  },
  {
    ...secondHand, street: 'PREFLOP', board: [], pot: 260, actor: YOU,
    seats: [{ chips: 1250, bet: 20, cards: ['7C', '2D'] }, { chips: 870, bet: 120, action: 'RAISE' }, { chips: 620, bet: 120, action: 'CALL' }],
    expect: 'FOLD', dock: { callAmount: 100, minRaiseTo: 220, maxRaiseTo: 220 },
    title: 'Ván mới: biết lúc FOLD',
    text: 'Nút D chuyển sang Mai, bạn đặt big blind 20. Bạn cầm 7♣ 2♦, tay khởi đầu yếu nhất của Hold’em, trong khi Mai RAISE lên 120 và Khoa theo. Không phải ván nào cũng nên chơi: bấm FOLD, bạn chỉ mất 20.',
  },
  {
    ...secondHand, street: 'PREFLOP', board: [], pot: 260, final: true,
    seats: [{ chips: 1250, bet: 20, action: 'FOLD', folded: true, cards: ['7C', '2D'] }, { chips: 870, bet: 120, action: 'RAISE' },
      { chips: 620, bet: 120, action: 'CALL' }],
    title: 'Bạn đã sẵn sàng',
    text: 'Bạn đã dùng đủ FOLD, CHECK, CALL và RAISE, biết blind, nút D và cách so bài. Ở bàn thật mỗi lượt có 20 giây, đồng hồ hiện ở thanh trên. Bấm Hoàn thành để kết thúc hướng dẫn.',
  },
]
