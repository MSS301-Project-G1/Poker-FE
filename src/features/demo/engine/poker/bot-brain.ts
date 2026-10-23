import { cardKey, createDeck, type Card } from './cards';
import { scoreHand } from './hand-evaluator';
import type { PlayerAction, TableEngine } from './table-engine';

/** How a bot leans. All values 0..1. */
export type BotPersona = {
  /** Higher folds marginal hands more often. */
  tightness: number;
  /** Higher bets/raises instead of calling. */
  aggression: number;
  /** Chance-weight of bluffing with weak hands. */
  bluff: number;
};

const FULL_DECK = createDeck();

/**
 * Monte Carlo showdown equity of `hole` against `opponents` random hands.
 * Ties count as a fractional win so split pots don't look like losses.
 */
export function estimateEquity(
  hole: Card[],
  board: Card[],
  opponents: number,
  iterations: number,
  rng: () => number,
): number {
  const known = new Set([...hole, ...board].map(cardKey));
  const pool = FULL_DECK.filter((c) => !known.has(cardKey(c)));
  const need = opponents * 2 + (5 - board.length);
  const hero: Card[] = [...hole, ...board];
  const runBoard: Card[] = [...board];
  let wins = 0;

  for (let it = 0; it < iterations; it += 1) {
    // Partial Fisher–Yates: only shuffle the cards we draw.
    for (let i = 0; i < need; i += 1) {
      const j = i + Math.floor(rng() * (pool.length - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    let cursor = 0;
    runBoard.length = board.length;
    while (runBoard.length < 5) runBoard.push(pool[cursor++]);
    hero.length = 2;
    hero.push(...runBoard);
    const heroScore = scoreHand(hero);

    let best = true;
    let ties = 0;
    for (let o = 0; o < opponents; o += 1) {
      const oppScore = scoreHand([pool[cursor++], pool[cursor++], ...runBoard]);
      if (oppScore > heroScore) {
        best = false;
        break;
      }
      if (oppScore === heroScore) ties += 1;
    }
    if (best) wins += 1 / (ties + 1);
  }
  return wins / iterations;
}

export function decideBotAction(table: TableEngine, seatIndex: number, persona: BotPersona, rng: () => number): PlayerAction {
  const seat = table.seats[seatIndex];
  const legal = table.legalActions(seatIndex);
  const opponents = table.seats.filter((s) => s.index !== seatIndex && !s.folded).length;
  const equity = estimateEquity(seat.hole, table.board, Math.max(1, opponents), 140, rng);
  // >1 means stronger than an average hand at this table size.
  const relative = equity * (opponents + 1);
  const pot = table.potTotal;
  const noise = (rng() - 0.5) * 0.25;
  const bb = table.bigBlind;
  const shortStack = seat.stack <= bb * 8;

  const sizeRaise = (fraction: number): PlayerAction => {
    const base = Math.max(table.currentBet, bb);
    const target = table.currentBet === 0 ? Math.round(pot * fraction) : Math.round(base + pot * fraction);
    const raiseTo = Math.max(legal.minRaiseTo, roundTo(target, Math.max(5, Math.floor(bb / 2))));
    if (raiseTo >= legal.maxRaiseTo * 0.7 || shortStack) return { type: 'allin' };
    return { type: 'raise', raiseTo };
  };

  const raiseCapReached = table.raisesThisStreet >= 3 && relative < 2.6;

  if (legal.toCall === 0) {
    const betThreshold = 1.55 - persona.aggression * 0.45 + noise;
    if (legal.canRaise && !raiseCapReached && relative > betThreshold) return sizeRaise(0.45 + rng() * 0.45);
    if (legal.canRaise && rng() < persona.bluff * 0.14) return sizeRaise(0.35);
    return { type: 'check' };
  }

  const potOdds = legal.toCall / (pot + legal.toCall);
  const raiseThreshold = 2.05 - persona.aggression * 0.55 + noise;
  if (legal.canRaise && !raiseCapReached && relative > raiseThreshold && rng() < 0.45 + persona.aggression * 0.45) {
    return sizeRaise(0.6 + rng() * 0.5);
  }
  const callNeed = potOdds * (0.85 + persona.tightness * 0.7) + noise * 0.3;
  if (equity >= callNeed) {
    return legal.callAmount >= seat.stack ? { type: 'allin' } : { type: 'call' };
  }
  if (legal.canRaise && !raiseCapReached && rng() < persona.bluff * 0.05) return sizeRaise(0.7);
  return { type: 'fold' };
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}
