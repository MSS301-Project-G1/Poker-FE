/** Card primitives shared by the engine, bots, 3D card factory and HUD. */
export type Card = {
  /** 2..14 where 11=J, 12=Q, 13=K, 14=A. */
  rank: number;
  /** 0=♠ 1=♥ 2=♦ 3=♣ */
  suit: number;
};

export const SUIT_SYMBOLS = ['♠', '♥', '♦', '♣'] as const;

const FACE_LABELS: Record<number, string> = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };

export function rankLabel(rank: number): string {
  return FACE_LABELS[rank] ?? String(rank);
}

export function cardLabel(card: Card): string {
  return `${rankLabel(card.rank)}${SUIT_SYMBOLS[card.suit]}`;
}

export function cardKey(card: Card): number {
  return card.rank * 4 + card.suit;
}

export function isRedSuit(suit: number): boolean {
  return suit === 1 || suit === 2;
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (let suit = 0; suit < 4; suit += 1) {
    for (let rank = 2; rank <= 14; rank += 1) deck.push({ rank, suit });
  }
  return deck;
}

/** Fisher–Yates in place, driven by the caller's seeded RNG. */
export function shuffle<T>(items: T[], rng: () => number): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
