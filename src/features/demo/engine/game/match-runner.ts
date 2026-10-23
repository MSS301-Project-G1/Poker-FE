import type { BotProfile } from '../meta/bot-roster';
import type { QueueMode } from '../meta/matchmaking-sim';
import { decideBotAction } from '../poker/bot-brain';
import type { Card } from '../poker/cards';
import { describeHand, describePartial, evaluateHand } from '../poker/hand-evaluator';
import { TableEngine, type LegalActions, type PlayerAction, type ShowdownReveal, type TableEvent } from '../poker/table-engine';
import type { TableScene } from '../scene/table-scene';
import type { Tweens } from '../scene/tweens';
import type { SoundName } from '../systems/AudioSystem';
import { formatChips } from '../ui/dom-helpers';
import type { ActionContext, TableHud } from '../ui/table-hud';

export type MatchSeat = { id: string; name: string; isHuman: boolean; bot: BotProfile | null; partyMember: boolean };
export type MatchConfig = { mode: QueueMode; matchId: string; seats: MatchSeat[]; startingStack: number };
export type MatchOutcome = {
  aborted: boolean;
  placement: number;
  playerCount: number;
  hands: number;
  /** Seat ids from first eliminated to the winner (only the part that was played). */
  eliminated: string[];
  winnerId: string | null;
  biggestPot: number;
};
export type BotMoment = 'win' | 'bigWin' | 'allin' | 'fold' | 'greet';

export type MatchHooks = {
  sound(name: SoundName): void;
  botLine(seat: number, moment: BotMoment): void;
  system(text: string): void;
  /** Test/playtest autopilot for the human seat. Production leaves it unset. */
  heroPolicy?: (ctx: ActionContext) => PlayerAction;
  onShowdown?(): void;
};

export const BLIND_LEVELS: [number, number][] = [
  [10, 20], [15, 30], [25, 50], [40, 80], [60, 120], [100, 200], [150, 300], [250, 500], [400, 800], [600, 1200],
];
export const HANDS_PER_LEVEL = 6;
export const TURN_SECONDS = 20;

class MatchAborted extends Error {}

/**
 * Sit-and-go driver: runs hands on the pure TableEngine and plays each batch
 * of TableEvents back through the 3D scene and HUD in order. It keeps its own
 * "displayed" chip counts so stacks shrink when chips leave and pots grow only
 * when the chips land, instead of jumping to the engine's end-of-batch state.
 */
export class MatchRunner {
  readonly engine: TableEngine;
  readonly heroSeat: number;
  private aborted = false;
  private readonly stacks: number[];
  private readonly bets: number[];
  private handStartStacks: number[] = [];
  private pot = 0;
  private board: Card[] = [];
  private readonly revealed = new Set<number>();
  private readonly eliminated: number[] = [];
  private placement = 0;
  private biggestPot = 0;
  private realTimers: { at: number; resolve: () => void }[] = [];
  private realNow = 0;

  constructor(
    readonly config: MatchConfig,
    private readonly scene: TableScene,
    private readonly hud: TableHud,
    private readonly tweens: Tweens,
    private readonly rng: () => number,
    private readonly hooks: MatchHooks,
  ) {
    this.engine = new TableEngine(config.seats.map((s) => ({ name: s.name, isHuman: s.isHuman, stack: config.startingStack })), rng);
    this.heroSeat = config.seats.findIndex((s) => s.isHuman);
    this.stacks = config.seats.map(() => config.startingStack);
    this.bets = config.seats.map(() => 0);
  }

  get blindLevel(): number {
    return Math.min(BLIND_LEVELS.length - 1, Math.floor(this.engine.handNo / HANDS_PER_LEVEL));
  }

  /** Unscaled clock for the human turn timer (speed-up must not shorten it). */
  tickReal(now: number): void {
    this.realNow = now;
    if (!this.realTimers.length) return;
    const due = this.realTimers.filter((t) => t.at <= now);
    if (!due.length) return;
    this.realTimers = this.realTimers.filter((t) => t.at > now);
    for (const t of due) t.resolve();
  }

  abort(): void {
    if (this.aborted) return;
    this.aborted = true;
    this.hud.cancelAction({ type: 'fold' });
    for (const t of this.realTimers) t.resolve();
    this.realTimers = [];
    this.tweens.flush();
  }

  async run(): Promise<MatchOutcome> {
    try {
      this.syncChips();
      this.config.seats.forEach((_, i) => this.hud.updateSeat(i, { stack: this.stacks[i], busted: false, folded: false, allIn: false, action: null }));
      this.config.seats.forEach((seat, i) => {
        if (seat.bot && this.rng() < 0.6) this.hooks.botLine(i, 'greet');
      });
      await this.wait(0.8);
      while (this.engine.playersWithChips.length >= 2 && !this.engine.seats[this.heroSeat].busted) {
        const [sb, bb] = BLIND_LEVELS[this.blindLevel];
        this.engine.setBlinds(sb, bb);
        this.handStartStacks = this.engine.seats.map((s) => s.stack);
        await this.present(this.engine.startHand());
        while (this.engine.inBetting) {
          const seat = this.engine.toAct;
          const action = await this.decide(seat);
          await this.present(this.engine.act(seat, action));
        }
      }
      const hero = this.engine.seats[this.heroSeat];
      if (!hero.busted) this.placement = 1;
      const winner = this.engine.playersWithChips.length === 1 ? this.engine.playersWithChips[0] : null;
      return this.outcome(false, winner ? this.config.seats[winner.index].id : null);
    } catch (error) {
      if (error instanceof MatchAborted) {
        // Leaving counts as finishing last among the players still seated.
        this.placement = this.engine.playersWithChips.length;
        return this.outcome(true, null);
      }
      throw error;
    }
  }

  private outcome(aborted: boolean, winnerId: string | null): MatchOutcome {
    return {
      aborted,
      placement: this.placement,
      playerCount: this.config.seats.length,
      hands: this.engine.handNo,
      eliminated: this.eliminated.map((i) => this.config.seats[i].id),
      winnerId,
      biggestPot: this.biggestPot,
    };
  }

  private async decide(seat: number): Promise<PlayerAction> {
    const legal = this.engine.legalActions(seat);
    this.scene.setActor(seat);
    if (seat === this.heroSeat) {
      const action = await this.heroDecision(legal);
      this.hud.setActor(-1);
      return action;
    }
    this.hud.setActor(seat);
    this.scene.setMood(seat, 'thinking');
    await this.wait(0.7 + this.rng() * 0.8);
    const persona = this.config.seats[seat].bot?.persona ?? { tightness: 0.5, aggression: 0.5, bluff: 0.2 };
    const action = decideBotAction(this.engine, seat, persona, this.rng);
    this.scene.setMood(seat, 'idle');
    this.hud.setActor(-1);
    return action;
  }

  private async heroDecision(legal: LegalActions): Promise<PlayerAction> {
    const ctx: ActionContext = {
      legal,
      pot: this.engine.potTotal,
      bigBlind: this.engine.bigBlind,
      currentBet: this.engine.currentBet,
      heroBet: this.engine.seats[this.heroSeat].bet,
    };
    this.hooks.sound('turn');
    this.hud.setActor(this.heroSeat, this.realNow, TURN_SECONDS);
    if (this.hooks.heroPolicy) {
      const request = this.hud.requestAction(ctx);
      await this.wait(0.25);
      this.hud.cancelAction(this.hooks.heroPolicy(ctx));
      return this.guard(request);
    }
    let settled = false;
    const timeout = this.realWait(TURN_SECONDS).then((): PlayerAction => {
      if (!settled && !this.aborted) {
        this.hud.cancelAction();
        this.hud.showBanner('Hết giờ — tự động ' + (legal.canCheck ? 'xem bài' : 'bỏ bài'), 'info', this.hud.clock, 1.8);
      }
      return { type: legal.canCheck ? 'check' : 'fold' };
    });
    const action = await Promise.race([this.hud.requestAction(ctx), timeout]);
    settled = true;
    return this.guard(action);
  }

  private async present(events: TableEvent[]): Promise<void> {
    let reveals: Map<number, ShowdownReveal> | null = null;
    const showdown = events.find((e): e is Extract<TableEvent, { type: 'showdown' }> => e.type === 'showdown');
    const hero = this.engine.seats[this.heroSeat];

    for (let index = 0; index < events.length; index += 1) {
      const e = events[index];
      switch (e.type) {
        case 'hand-start': {
          this.scene.clearHand();
          this.board = [];
          this.revealed.clear();
          this.config.seats.forEach((_, i) => {
            const s = this.engine.seats[i];
            this.hud.updateSeat(i, { action: null, folded: s.busted, allIn: false, handName: null, winner: false, dealer: i === e.dealer });
            if (!s.busted) this.scene.setMood(i, 'idle');
          });
          this.hud.setHeroHint('');
          const handsLeft = HANDS_PER_LEVEL - ((e.handNo - 1) % HANDS_PER_LEVEL);
          const lastLevel = this.blindLevel === BLIND_LEVELS.length - 1;
          this.hud.setInfo(`Ván ${e.handNo} · Mù ${formatChips(e.sb)}/${formatChips(e.bb)}${lastLevel ? '' : ` · Lên mù sau ${handsLeft} ván`}`);
          if (e.handNo > 1 && (e.handNo - 1) % HANDS_PER_LEVEL === 0) {
            this.hud.showBanner(`Lên mù ${formatChips(e.sb)}/${formatChips(e.bb)}`, 'info', this.hud.clock, 1.6);
          }
          this.scene.moveDealer(e.dealer);
          this.hooks.sound('shuffle');
          await this.wait(0.45);
          break;
        }
        case 'blind':
          this.hud.updateSeat(e.seat, { action: e.kind });
          await this.moveToBet(e.seat, e.amount);
          break;
        case 'deal-hole':
          this.hooks.sound('card');
          await this.guard(this.scene.dealHole(e.seats, this.heroSeat, hero.hole));
          this.hud.setHeroHint(describePartial(hero.hole));
          break;
        case 'action': {
          const allIn = this.engine.seats[e.seat].allIn && e.action !== 'fold';
          this.hud.updateSeat(e.seat, { action: allIn ? 'allin' : e.action, folded: e.action === 'fold', allIn });
          this.hooks.sound(e.action === 'fold' ? 'fold' : e.action === 'check' ? 'check' : 'chip');
          if (e.action === 'fold') {
            this.scene.setMood(e.seat, 'folded');
            if (e.seat === this.heroSeat) this.hud.setHeroHint('Đã bỏ bài');
            else if (this.rng() < 0.18) this.hooks.botLine(e.seat, 'fold');
            await this.guard(this.scene.foldCards(e.seat));
          }
          if (e.amount > 0) await this.moveToBet(e.seat, e.amount);
          if (allIn) {
            this.scene.setMood(e.seat, 'allin');
            if (e.seat !== this.heroSeat && this.rng() < 0.55) this.hooks.botLine(e.seat, 'allin');
          }
          await this.wait(0.18);
          break;
        }
        case 'collect': {
          const total = this.bets.reduce((a, b) => a + b, 0);
          if (total > 0) {
            const moving = [...this.bets];
            this.bets.fill(0);
            this.syncChips();
            await this.guard(this.scene.flyCollect(moving));
            this.pot += total;
            this.syncChips();
          }
          this.config.seats.forEach((_, i) => {
            const s = this.engine.seats[i];
            if (!s.folded && !s.allIn) this.hud.updateSeat(i, { action: null });
          });
          // All-in runout: turn the cards over before the remaining board comes.
          const runout = showdown && events.slice(index + 1).some((n) => n.type === 'street');
          if (runout) await this.revealAll(showdown.reveals);
          break;
        }
        case 'street':
          this.hooks.sound('card');
          await this.guard(this.scene.dealBoard(e.cards));
          this.board.push(...e.cards);
          if (!hero.folded) this.hud.setHeroHint(describeHand(evaluateHand([...hero.hole, ...this.board])));
          break;
        case 'showdown':
          reveals = new Map(e.reveals.map((r) => [r.seat, r]));
          this.hooks.onShowdown?.();
          await this.revealAll(e.reveals);
          for (const r of e.reveals) this.hud.updateSeat(r.seat, { handName: r.handName });
          await this.wait(0.6);
          break;
        case 'award': {
          this.biggestPot = Math.max(this.biggestPot, e.amount);
          this.pot -= e.amount;
          this.syncChips();
          await this.guard(this.scene.flyAward(e.seat, e.amount));
          this.stacks[e.seat] += e.amount;
          this.syncChips();
          this.hud.updateSeat(e.seat, { stack: this.stacks[e.seat], winner: true });
          this.scene.celebrate(e.seat);
          const best = reveals?.get(e.seat)?.value.best;
          if (best) this.scene.highlightCards(best);
          const name = e.seat === this.heroSeat ? 'Bạn' : this.config.seats[e.seat].name;
          const suffix = e.handName ? ` · ${e.handName}` : '';
          this.hud.showBanner(`${name} thắng ${formatChips(e.amount)}${suffix}`, e.seat === this.heroSeat ? 'win' : 'info', this.hud.clock, 2.6);
          if (e.seat === this.heroSeat) this.hooks.sound('win');
          else if (this.rng() < 0.5) this.hooks.botLine(e.seat, e.amount >= this.engine.bigBlind * 12 ? 'bigWin' : 'win');
          await this.wait(0.35);
          break;
        }
        case 'hand-end':
          await this.wait(reveals ? 2.4 : 1.4);
          this.finishHand();
          break;
      }
    }
  }

  private finishHand(): void {
    const newlyBusted = this.engine.seats
      .filter((s) => s.busted && !this.eliminated.includes(s.index))
      // Bigger stack at the start of the hand places higher when several bust together.
      .sort((a, b) => (this.handStartStacks[a.index] ?? 0) - (this.handStartStacks[b.index] ?? 0));
    let place = this.engine.playersWithChips.length + newlyBusted.length;
    for (const s of newlyBusted) {
      this.eliminated.push(s.index);
      this.hud.updateSeat(s.index, { busted: true, action: null });
      this.scene.setMood(s.index, 'folded');
      this.hooks.system(`${s.isHuman ? 'Bạn' : s.name} bị loại · hạng ${place}`);
      if (s.index === this.heroSeat) this.placement = place;
      place -= 1;
    }
    // Displayed counts must agree with the engine once the hand is settled.
    this.engine.seats.forEach((s, i) => {
      this.stacks[i] = s.stack;
      this.bets[i] = 0;
      this.hud.updateSeat(i, { stack: s.stack });
    });
    this.pot = 0;
    this.syncChips();
  }

  private async revealAll(reveals: ShowdownReveal[]): Promise<void> {
    for (const r of reveals) {
      if (this.revealed.has(r.seat)) continue;
      this.revealed.add(r.seat);
      if (r.seat === this.heroSeat) continue;
      this.hooks.sound('card');
      await this.guard(this.scene.revealHand(r.seat, r.hole));
    }
  }

  private async moveToBet(seat: number, amount: number): Promise<void> {
    this.stacks[seat] -= amount;
    this.hud.updateSeat(seat, { stack: this.stacks[seat] });
    this.syncChips();
    this.hooks.sound('chip');
    await this.guard(this.scene.flyBet(seat, amount));
    this.bets[seat] += amount;
    this.syncChips();
  }

  private syncChips(): void {
    this.scene.layoutChips(this.stacks, this.bets, this.pot);
    this.hud.setPot(this.pot + this.bets.reduce((a, b) => a + b, 0));
  }

  private wait(seconds: number): Promise<void> {
    return this.guard(this.tweens.wait(seconds));
  }

  private realWait(seconds: number): Promise<void> {
    return new Promise((resolve) => this.realTimers.push({ at: this.realNow + seconds, resolve }));
  }

  /** Every await point re-checks for an abort so leaving never leaves a dangling hand loop. */
  private async guard<T>(pending: T | Promise<T>): Promise<T> {
    const value = await pending;
    if (this.aborted) throw new MatchAborted();
    return value;
  }
}
