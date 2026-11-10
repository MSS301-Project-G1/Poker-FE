/** Card primitives shared by the 3D card factory and the live table. */
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
