import { createDeck, shuffle, type Card } from './cards';
import { describeHand, evaluateHand, type HandValue } from './hand-evaluator';

/**
 * No-limit Texas Hold'em table state machine. Pure and synchronous: every
 * mutation returns the TableEvents it produced so the presentation layer can
 * animate them in order without reading engine internals mid-animation.
 *
 * Simplification: an all-in that is smaller than a full raise still reopens
 * betting for everyone (casual-table rule).
 */

export type Street = 'idle' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'allin';

export type PlayerAction = { type: ActionType; /** total bet level this street, for raise */ raiseTo?: number };

export type SeatState = {
  index: number;
  name: string;
  isHuman: boolean;
  stack: number;
  /** Chips committed on the current street. */
  bet: number;
  /** Chips committed this hand (all streets). */
  totalBet: number;
  folded: boolean;
  allIn: boolean;
  /** Out of the tournament (no chips at hand start). */
  busted: boolean;
  /** Not dealt into the current hand. */
  sittingOut: boolean;
  hole: Card[];
  lastAction: string | null;
};

export type ShowdownReveal = { seat: number; hole: Card[]; value: HandValue; handName: string };

export type TableEvent =
  | { type: 'hand-start'; handNo: number; dealer: number; sb: number; bb: number }
  | { type: 'blind'; seat: number; amount: number; kind: 'sb' | 'bb' }
  | { type: 'deal-hole'; seats: number[] }
  | { type: 'action'; seat: number; action: ActionType; amount: number; betLevel: number }
  | { type: 'collect' }
  | { type: 'street'; street: Street; cards: Card[] }
  | { type: 'showdown'; reveals: ShowdownReveal[] }
  | { type: 'award'; seat: number; amount: number; handName: string | null }
  | { type: 'hand-end' };

export type LegalActions = {
  toCall: number;
  canCheck: boolean;
  callAmount: number;
  canRaise: boolean;
  minRaiseTo: number;
  maxRaiseTo: number;
};

export class TableEngine {
  readonly seats: SeatState[];
  board: Card[] = [];
  street: Street = 'idle';
  dealer = -1;
  toAct = -1;
  currentBet = 0;
  minRaise = 0;
  handNo = 0;
  smallBlind = 10;
  bigBlind = 20;
  raisesThisStreet = 0;

  private deck: Card[] = [];
  private needsToAct = new Set<number>();

  constructor(
    players: { name: string; isHuman: boolean; stack: number }[],
    private rng: () => number,
  ) {
    this.seats = players.map((p, index) => ({
      index,
      name: p.name,
      isHuman: p.isHuman,
      stack: p.stack,
      bet: 0,
      totalBet: 0,
      folded: false,
      allIn: false,
      busted: p.stack <= 0,
      sittingOut: false,
      hole: [],
      lastAction: null,
    }));
  }

  setBlinds(small: number, big: number): void {
    this.smallBlind = small;
    this.bigBlind = big;
  }

  /** Chips in the middle including uncollected street bets. */
  get potTotal(): number {
    return this.seats.reduce((sum, s) => sum + s.totalBet, 0);
  }

  /** Chips already swept into the centre (excludes bets in front of players). */
  get collectedPot(): number {
    return this.seats.reduce((sum, s) => sum + s.totalBet - s.bet, 0);
  }

  get playersWithChips(): SeatState[] {
    return this.seats.filter((s) => !s.busted);
  }

  get inBetting(): boolean {
    return this.street !== 'idle' && this.street !== 'showdown' && this.toAct >= 0;
  }

  startHand(): TableEvent[] {
    const live = this.playersWithChips;
    if (live.length < 2) throw new Error('Need at least two players with chips to start a hand.');

    this.handNo += 1;
    this.board = [];
    this.deck = shuffle(createDeck(), this.rng);
    this.raisesThisStreet = 0;
    for (const s of this.seats) {
      s.bet = 0;
      s.totalBet = 0;
      s.folded = s.busted;
      s.sittingOut = s.busted;
      s.allIn = false;
      s.hole = [];
      s.lastAction = null;
    }

    this.dealer = this.nextSeat(this.dealer, (s) => !s.busted);
    const headsUp = live.length === 2;
    const sbSeat = headsUp ? this.dealer : this.nextSeat(this.dealer, (s) => !s.busted);
    const bbSeat = this.nextSeat(sbSeat, (s) => !s.busted);

    const events: TableEvent[] = [
      { type: 'hand-start', handNo: this.handNo, dealer: this.dealer, sb: this.smallBlind, bb: this.bigBlind },
    ];

    this.street = 'preflop';
    const sbPaid = this.commit(sbSeat, this.smallBlind);
    events.push({ type: 'blind', seat: sbSeat, amount: sbPaid, kind: 'sb' });
    const bbPaid = this.commit(bbSeat, this.bigBlind);
    events.push({ type: 'blind', seat: bbSeat, amount: bbPaid, kind: 'bb' });
    this.currentBet = Math.max(this.seats[sbSeat].bet, this.seats[bbSeat].bet, this.bigBlind);
    this.minRaise = this.bigBlind;

    // Deal two rounds starting left of the dealer, like a real dealer.
    const order: number[] = [];
    let seat = this.dealer;
    for (let i = 0; i < live.length; i += 1) {
      seat = this.nextSeat(seat, (s) => !s.busted);
      order.push(seat);
    }
    for (let round = 0; round < 2; round += 1) {
      for (const s of order) this.seats[s].hole.push(this.draw());
    }
    events.push({ type: 'deal-hole', seats: order });

    this.needsToAct = new Set(order.filter((s) => !this.seats[s].allIn));
    this.toAct = this.nextSeat(bbSeat, (s) => this.needsToAct.has(s.index));
    if (this.needsToAct.size === 0) this.toAct = -1;
    if (this.toAct < 0 || this.needsToAct.size === 0) events.push(...this.advance());
    else if (this.canActCount() <= 1 && this.seats[this.toAct].bet >= this.currentBet) events.push(...this.advance(true));
    return events;
  }

  legalActions(seatIndex: number): LegalActions {
    const s = this.seats[seatIndex];
    const toCall = Math.max(0, this.currentBet - s.bet);
    const maxRaiseTo = s.bet + s.stack;
    const othersCanAct = this.seats.some((o) => o.index !== seatIndex && !o.folded && !o.allIn);
    return {
      toCall,
      canCheck: toCall === 0,
      callAmount: Math.min(toCall, s.stack),
      canRaise: s.stack > toCall && othersCanAct,
      minRaiseTo: Math.min(this.currentBet + this.minRaise, maxRaiseTo),
      maxRaiseTo,
    };
  }

  act(seatIndex: number, action: PlayerAction): TableEvent[] {
    if (seatIndex !== this.toAct) throw new Error(`Seat ${seatIndex} acted out of turn (toAct=${this.toAct}).`);
    const s = this.seats[seatIndex];
    const legal = this.legalActions(seatIndex);
    let type = action.type;
    let amount = 0;

    if (type === 'check' && !legal.canCheck) type = 'call';
    if (type === 'raise' && !legal.canRaise) type = legal.canCheck ? 'check' : 'call';
    if (type === 'raise') {
      const target = Math.round(action.raiseTo ?? legal.minRaiseTo);
      if (target >= legal.maxRaiseTo) type = 'allin';
      else {
        const raiseTo = Math.max(target, legal.minRaiseTo);
        amount = this.commit(seatIndex, raiseTo - s.bet);
        this.registerRaise(seatIndex, raiseTo);
      }
    }
    if (type === 'allin') {
      const newLevel = s.bet + s.stack;
      amount = this.commit(seatIndex, s.stack);
      if (newLevel > this.currentBet) this.registerRaise(seatIndex, newLevel);
      else type = 'call';
    } else if (type === 'call') {
      amount = this.commit(seatIndex, legal.callAmount);
      if (amount === 0) type = 'check';
    } else if (type === 'fold') {
      s.folded = true;
    }

    s.lastAction = type;
    this.needsToAct.delete(seatIndex);
    const events: TableEvent[] = [{ type: 'action', seat: seatIndex, action: type, amount, betLevel: s.bet }];
    events.push(...this.advance());
    return events;
  }

  private registerRaise(seatIndex: number, raiseTo: number): void {
    const raiseSize = raiseTo - this.currentBet;
    if (raiseSize >= this.minRaise) this.minRaise = raiseSize;
    this.currentBet = raiseTo;
    this.raisesThisStreet += 1;
    this.needsToAct = new Set(
      this.seats.filter((o) => o.index !== seatIndex && !o.folded && !o.allIn).map((o) => o.index),
    );
  }

  private advance(forceRunout = false): TableEvent[] {
    const events: TableEvent[] = [];
    const alive = this.seats.filter((s) => !s.folded);

    if (alive.length === 1) {
      events.push({ type: 'collect' });
      this.collectBets();
      const winner = alive[0];
      const amount = this.potTotal;
      winner.stack += amount;
      events.push({ type: 'award', seat: winner.index, amount, handName: null });
      return events.concat(this.finishHand());
    }

    if (!forceRunout && this.needsToAct.size > 0) {
      this.toAct = this.nextSeat(this.toAct, (s) => this.needsToAct.has(s.index));
      return events;
    }

    events.push({ type: 'collect' });
    this.collectBets();
    this.toAct = -1;

    const canAct = this.canActCount();
    if (this.street === 'river') return events.concat(this.showdown());
    if (canAct <= 1) {
      while (this.board.length < 5) events.push(this.dealStreet());
      return events.concat(this.showdown());
    }

    events.push(this.dealStreet());
    this.currentBet = 0;
    this.minRaise = this.bigBlind;
    this.raisesThisStreet = 0;
    for (const s of this.seats) if (!s.folded) s.lastAction = s.allIn ? 'allin' : null;
    this.needsToAct = new Set(this.seats.filter((s) => !s.folded && !s.allIn).map((s) => s.index));
    this.toAct = this.nextSeat(this.dealer, (s) => this.needsToAct.has(s.index));
    return events;
  }

  private dealStreet(): TableEvent {
    const next: Record<string, Street> = { preflop: 'flop', flop: 'turn', turn: 'river' };
    this.street = next[this.street];
    this.draw(); // burn card
    const count = this.street === 'flop' ? 3 : 1;
    const cards: Card[] = [];
    for (let i = 0; i < count; i += 1) cards.push(this.draw());
    this.board.push(...cards);
    return { type: 'street', street: this.street, cards };
  }

  private showdown(): TableEvent[] {
    this.street = 'showdown';
    const alive = this.seats.filter((s) => !s.folded);
    const reveals: ShowdownReveal[] = alive.map((s) => {
      const value = evaluateHand([...s.hole, ...this.board]);
      return { seat: s.index, hole: s.hole, value, handName: describeHand(value) };
    });
    const valueBySeat = new Map(reveals.map((r) => [r.seat, r]));
    const events: TableEvent[] = [{ type: 'showdown', reveals }];

    // Side pots: slice contributions at each distinct all-in level.
    const levels = [...new Set(alive.map((s) => s.totalBet))].sort((a, b) => a - b);
    const awards = new Map<number, number>();
    let previous = 0;
    for (const level of levels) {
      let amount = 0;
      for (const s of this.seats) amount += Math.min(s.totalBet, level) - Math.min(s.totalBet, previous);
      previous = level;
      if (amount <= 0) continue;
      const eligible = alive.filter((s) => s.totalBet >= level);
      const bestScore = Math.max(...eligible.map((s) => valueBySeat.get(s.index)!.value.score));
      const winners = this.clockwiseFromDealer(eligible.filter((s) => valueBySeat.get(s.index)!.value.score === bestScore));
      const share = Math.floor(amount / winners.length);
      let remainder = amount - share * winners.length;
      for (const w of winners) {
        const extra = remainder > 0 ? 1 : 0;
        remainder -= extra;
        awards.set(w.index, (awards.get(w.index) ?? 0) + share + extra);
      }
    }
    for (const [seat, amount] of awards) {
      this.seats[seat].stack += amount;
      events.push({ type: 'award', seat, amount, handName: valueBySeat.get(seat)!.handName });
    }
    return events.concat(this.finishHand());
  }

  private finishHand(): TableEvent[] {
    for (const s of this.seats) {
      s.bet = 0;
      s.totalBet = 0;
      if (s.stack <= 0) s.busted = true;
    }
    this.toAct = -1;
    if (this.street !== 'showdown') this.street = 'showdown';
    return [{ type: 'hand-end' }];
  }

  private collectBets(): void {
    for (const s of this.seats) s.bet = 0;
  }

  private commit(seatIndex: number, requested: number): number {
    const s = this.seats[seatIndex];
    const amount = Math.max(0, Math.min(requested, s.stack));
    s.stack -= amount;
    s.bet += amount;
    s.totalBet += amount;
    if (s.stack === 0 && !s.folded) s.allIn = true;
    return amount;
  }

  private canActCount(): number {
    return this.seats.filter((s) => !s.folded && !s.allIn).length;
  }

  private draw(): Card {
    const card = this.deck.pop();
    if (!card) throw new Error('Deck exhausted.');
    return card;
  }

  private clockwiseFromDealer(list: SeatState[]): SeatState[] {
    const n = this.seats.length;
    return [...list].sort((a, b) => ((a.index - this.dealer - 1 + n) % n) - ((b.index - this.dealer - 1 + n) % n));
  }

  nextSeat(from: number, predicate: (s: SeatState) => boolean): number {
    const n = this.seats.length;
    for (let step = 1; step <= n; step += 1) {
      const idx = (((from + step) % n) + n) % n;
      if (predicate(this.seats[idx])) return idx;
    }
    return -1;
  }
}
