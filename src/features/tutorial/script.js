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
    title: 'Welcome to the practice table',
    text: 'This is a scripted Texas Hold’em hand against two bots. Everyone gets 2 private cards and the board deals 5 shared cards; the best 5-card hand from those 7 wins the pot. Chips here are for practice only.',
  },
  {
    ...firstHand, street: 'PREFLOP', board: [], pot: 30,
    seats: [{ chips: 1000, cards: ['AS', 'KS'] }, { chips: 990, bet: 10 }, { chips: 980, bet: 20 }],
    title: 'Blinds and the D button',
    text: 'Mai posts the small blind (SB) of 10 and Khoa posts the big blind (BB) of 20: forced bets so every hand has a pot. The D (dealer) button is on you; next hand it moves to the next player.',
  },
  {
    ...firstHand, street: 'PREFLOP', board: [], pot: 30, actor: YOU,
    seats: [{ chips: 1000, cards: ['AS', 'KS'] }, { chips: 990, bet: 10 }, { chips: 980, bet: 20 }],
    expect: 'RAISE', dock: { callAmount: 20, minRaiseTo: 60, maxRaiseTo: 60 },
    title: 'RAISE with a strong hand',
    text: 'You hold A♠ K♠, one of the strongest starting hands. To stay in you must match the biggest bet (CALL 20). With a strong hand, raise to build the pot: press RAISE to 60.',
  },
  {
    ...firstHand, street: 'PREFLOP', board: [], pot: 130,
    seats: [{ chips: 940, bet: 60, action: 'RAISE', cards: ['AS', 'KS'] }, { chips: 990, bet: 10, action: 'FOLD', folded: true },
      { chips: 940, bet: 60, action: 'CALL' }],
    title: 'Opponents respond',
    text: 'Mai folds and loses the 10 already posted. Khoa calls another 40 to make 60. A betting round ends when everyone left has put in the same amount.',
  },
  {
    ...firstHand, street: 'FLOP', board: flop, pot: 130, actor: YOU,
    seats: [{ chips: 940, cards: ['AS', 'KS'] }, { chips: 990, action: 'FOLD', folded: true }, { chips: 940, action: 'CHECK' }],
    expect: 'CHECK', dock: { callAmount: 0, minRaiseTo: 20, maxRaiseTo: 20 },
    title: 'Flop: CHECK',
    text: 'The flop is K♥ 7♠ 2♠. You have a pair of kings, the top pair on the board, and one more ♠ makes a flush. Khoa checks (no bet). When nobody has bet, you can CHECK too and see the next card for free: press CHECK.',
  },
  {
    ...firstHand, street: 'TURN', board: [...flop, '9D'], pot: 180, actor: YOU,
    seats: [{ chips: 940, action: 'CHECK', cards: ['AS', 'KS'] }, { chips: 990, action: 'FOLD', folded: true }, { chips: 890, bet: 50, action: 'RAISE' }],
    expect: 'CALL', dock: { callAmount: 50, minRaiseTo: 100, maxRaiseTo: 100 },
    title: 'Turn: CALL',
    text: 'The turn is 9♦ and Khoa bets 50. You must CALL 50 to continue; if you FOLD you lose everything you’ve put in. Your hand is still good and the flush can still come: press CALL.',
  },
  {
    ...firstHand, street: 'RIVER', board: [...flop, '9D', 'QS'], pot: 230, actor: YOU,
    seats: [{ chips: 890, cards: ['AS', 'KS'] }, { chips: 990, action: 'FOLD', folded: true }, { chips: 890, action: 'CHECK' }],
    expect: 'RAISE', dock: { callAmount: 0, minRaiseTo: 150, maxRaiseTo: 150 },
    title: 'River: bet when you’re strong',
    text: 'The last card is Q♠: you have a FLUSH, A♠ K♠ Q♠ 7♠ 2♠. Khoa checks again. When you’re confident you’re ahead, bet so your opponent puts more chips in: press RAISE 150.',
  },
  {
    ...firstHand, street: 'HAND_FINISHED', board: [...flop, '9D', 'QS'], pot: 530, winner: YOU,
    result: 'You win 530 · Flush', distribution: { pots: [{ amount: 530, winnerSeats: [YOU] }], winnings: { [YOU]: 530 } },
    seats: [{ chips: 1270, action: 'RAISE', cards: ['AS', 'KS'], hand: 'FLUSH' }, { chips: 990, action: 'FOLD', folded: true },
      { chips: 740, action: 'CALL', cards: ['KD', 'QD'], hand: 'TWO_PAIR' }],
    title: 'Showdown',
    text: 'Khoa calls 150 and both hands are shown. Khoa has two pair, kings and queens; your flush is stronger, so you take the whole 530 pot. The full hand order is under Hand rankings at the top.',
  },
  {
    ...secondHand, street: 'PREFLOP', board: [], pot: 260, actor: YOU,
    seats: [{ chips: 1250, bet: 20, cards: ['7C', '2D'] }, { chips: 870, bet: 120, action: 'RAISE' }, { chips: 620, bet: 120, action: 'CALL' }],
    expect: 'FOLD', dock: { callAmount: 100, minRaiseTo: 220, maxRaiseTo: 220 },
    title: 'New hand: know when to FOLD',
    text: 'The D button moves to Mai and you post the big blind of 20. You hold 7♣ 2♦, the weakest starting hand in Hold’em, while Mai raises to 120 and Khoa calls. Not every hand is worth playing: press FOLD and you only lose 20.',
  },
  {
    ...secondHand, street: 'PREFLOP', board: [], pot: 260, final: true,
    seats: [{ chips: 1250, bet: 20, action: 'FOLD', folded: true, cards: ['7C', '2D'] }, { chips: 870, bet: 120, action: 'RAISE' },
      { chips: 620, bet: 120, action: 'CALL' }],
    title: 'You’re ready',
    text: 'You’ve used FOLD, CHECK, CALL and RAISE, and you know the blinds, the D button and how hands compare. At a real table each turn has 20 seconds; the timer is in the top bar. Press Finish to end the tutorial.',
  },
]
