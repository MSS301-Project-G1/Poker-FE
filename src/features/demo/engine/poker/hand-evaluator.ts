import { rankLabel, type Card } from './cards';

export type HandValue = {
  /** Comparable score: higher wins, equal splits. */
  score: number;
  category: number;
  /** The five cards forming the best hand. */
  best: Card[];
};

export const CATEGORY_NAMES = [
  'Mậu thầu',
  'Một đôi',
  'Thú',
  'Sám cô',
  'Sảnh',
  'Thùng',
  'Cù lũ',
  'Tứ quý',
  'Thùng phá sảnh',
] as const;

const KICKER_BASE = 15;
const CATEGORY_WEIGHT = KICKER_BASE ** 5;

/** Scores exactly five cards: category first, then kickers in base 15. */
function scoreFive(cards: Card[]): { score: number; category: number } {
  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a);
  const flush = cards.every((c) => c.suit === cards[0].suit);

  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  // Sort groups by size, then by rank, so kickers read in the right order.
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const groupRanks = groups.map((g) => g[0]);

  let straightHigh = 0;
  if (groups.length === 5) {
    if (ranks[0] - ranks[4] === 4) straightHigh = ranks[0];
    else if (ranks[0] === 14 && ranks[1] === 5) straightHigh = 5; // wheel A-2-3-4-5
  }

  let category: number;
  let kickers: number[];
  if (straightHigh && flush) [category, kickers] = [8, [straightHigh]];
  else if (groups[0][1] === 4) [category, kickers] = [7, groupRanks];
  else if (groups[0][1] === 3 && groups[1][1] === 2) [category, kickers] = [6, groupRanks];
  else if (flush) [category, kickers] = [5, ranks];
  else if (straightHigh) [category, kickers] = [4, [straightHigh]];
  else if (groups[0][1] === 3) [category, kickers] = [3, groupRanks];
  else if (groups[0][1] === 2 && groups[1][1] === 2) [category, kickers] = [2, groupRanks];
  else if (groups[0][1] === 2) [category, kickers] = [1, groupRanks];
  else [category, kickers] = [0, ranks];

  let kickerValue = 0;
  for (let i = 0; i < 5; i += 1) kickerValue = kickerValue * KICKER_BASE + (kickers[i] ?? 0);
  return { score: category * CATEGORY_WEIGHT + kickerValue, category };
}

/** Best 5-card hand out of 5–7 cards. */
export function evaluateHand(cards: Card[]): HandValue {
  if (cards.length < 5) throw new Error('evaluateHand needs at least 5 cards');
  let best: HandValue | null = null;
  const n = cards.length;
  const pick: Card[] = new Array(5);
  for (let a = 0; a < n - 4; a += 1)
    for (let b = a + 1; b < n - 3; b += 1)
      for (let c = b + 1; c < n - 2; c += 1)
        for (let d = c + 1; d < n - 1; d += 1)
          for (let e = d + 1; e < n; e += 1) {
            pick[0] = cards[a];
            pick[1] = cards[b];
            pick[2] = cards[c];
            pick[3] = cards[d];
            pick[4] = cards[e];
            const result = scoreFive(pick);
            if (!best || result.score > best.score) best = { ...result, best: pick.slice() };
          }
  return best as HandValue;
}

/** Score only — hot path for Monte Carlo equity, avoids allocating best-card arrays. */
export function scoreHand(cards: Card[]): number {
  let best = -1;
  const n = cards.length;
  const pick: Card[] = new Array(5);
  for (let a = 0; a < n - 4; a += 1)
    for (let b = a + 1; b < n - 3; b += 1)
      for (let c = b + 1; c < n - 2; c += 1)
        for (let d = c + 1; d < n - 1; d += 1)
          for (let e = d + 1; e < n; e += 1) {
            pick[0] = cards[a];
            pick[1] = cards[b];
            pick[2] = cards[c];
            pick[3] = cards[d];
            pick[4] = cards[e];
            const { score } = scoreFive(pick);
            if (score > best) best = score;
          }
  return best;
}

/** Vietnamese hand name, e.g. "Một đôi K", "Sảnh tới 9", "Thùng phá sảnh". */
export function describeHand(value: HandValue): string {
  const name = CATEGORY_NAMES[value.category];
  const kickerDigits = Math.floor(value.score % CATEGORY_WEIGHT);
  const top = Math.floor(kickerDigits / KICKER_BASE ** 4);
  switch (value.category) {
    case 1:
    case 3:
    case 7:
      return `${name} ${rankLabel(top)}`;
    case 4:
      return `${name} tới ${rankLabel(top)}`;
    case 8:
      return top === 14 ? 'Thùng phá sảnh lớn' : `${name} tới ${rankLabel(top)}`;
    default:
      return name;
  }
}

/** Partial description for 2–4 known cards (pre-flop / hint only). */
export function describePartial(cards: Card[]): string {
  if (cards.length >= 5) return describeHand(evaluateHand(cards));
  const counts = new Map<number, number>();
  for (const c of cards) counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1);
  const pairs = [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[0] - a[0]);
  if (pairs.length && pairs[0][1] >= 3) return `Sám cô ${rankLabel(pairs[0][0])}`;
  if (pairs.length >= 2) return 'Thú';
  if (pairs.length === 1) return `Một đôi ${rankLabel(pairs[0][0])}`;
  const high = Math.max(...cards.map((c) => c.rank));
  return `Mậu thầu ${rankLabel(high)}`;
}
