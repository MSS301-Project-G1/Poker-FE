import type { LegalActions, PlayerAction } from '../poker/table-engine';
import { el, formatChips, icon, initials, replaceChildren } from './dom-helpers';

export type HudSeat = { name: string; isHuman: boolean; isBot: boolean; partyMember: boolean };
export type SeatPatch = Partial<{
  stack: number;
  action: string | null;
  folded: boolean;
  allIn: boolean;
  busted: boolean;
  dealer: boolean;
  handName: string | null;
  winner: boolean;
}>;
export type ScreenPoint = { x: number; y: number; visible: boolean };
export type ActionContext = { legal: LegalActions; pot: number; bigBlind: number; currentBet: number; heroBet: number };

type Plate = {
  root: HTMLElement;
  stack: HTMLElement;
  action: HTMLElement;
  hand: HTMLElement;
  timer: HTMLElement;
  bubble: HTMLElement;
  bubbleUntil: number;
};

export const ACTION_LABELS: Record<string, string> = {
  fold: 'Bỏ',
  check: 'Xem',
  call: 'Theo',
  raise: 'Tố',
  allin: 'Tất tay',
  sb: 'Mù nhỏ',
  bb: 'Mù lớn',
};

/** Minimum gap between a seat plate and the viewport edge, and the reserved top bar height (px). */
const EDGE = 8;
const TOP_BAR = 56;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * DOM overlay for the 3D table: seat plates projected from 3D anchors, pot
 * label, hand info, banners and the hero's action bar. The match runner owns
 * game flow; the HUD only renders and turns input into PlayerActions.
 */
export class TableHud {
  readonly root: HTMLElement;
  private readonly plateLayer: HTMLElement;
  private readonly potLabel: HTMLElement;
  private readonly infoText: HTMLElement;
  private readonly modeTag: HTMLElement;
  private readonly banner: HTMLElement;
  private readonly heroDock: HTMLElement;
  private readonly heroStack: HTMLElement;
  private readonly heroHint: HTMLElement;
  private readonly heroTimer: HTMLElement;
  private readonly actionBar: HTMLElement;
  private readonly foldBtn: HTMLButtonElement;
  private readonly callBtn: HTMLButtonElement;
  private readonly raiseBtn: HTMLButtonElement;
  private readonly allinBtn: HTMLButtonElement;
  private readonly raisePanel: HTMLElement;
  private readonly raiseSlider: HTMLInputElement;
  private readonly raiseValue: HTMLElement;
  private readonly raiseConfirm: HTMLButtonElement;
  readonly chatButton: HTMLButtonElement;
  private readonly chatBadge: HTMLElement;
  readonly soundButton: HTMLButtonElement;
  readonly speedButton: HTMLButtonElement;
  readonly leaveButton: HTMLButtonElement;
  private plates: Plate[] = [];
  private heroSeat = 0;
  private pending: { resolve: (a: PlayerAction) => void; ctx: ActionContext } | null = null;
  private actor = -1;
  private turnStart = 0;
  private turnDuration = 0;
  private bannerUntil = 0;
  private now = 0;

  constructor() {
    this.plateLayer = el('div', { class: 'plate-layer', 'aria-hidden': 'false' });
    this.potLabel = el('div', { class: 'pot-label', hidden: true, 'aria-live': 'polite' });
    this.modeTag = el('span', { class: 'mode-tag' });
    this.infoText = el('span', { class: 'hand-info' });
    this.chatBadge = el('span', { class: 'badge', hidden: true });
    this.chatButton = el('button', { class: 'icon-button', type: 'button', 'aria-label': 'Mở chat trận', 'data-testid': 'chat-toggle' }, icon('forum'), this.chatBadge);
    this.soundButton = el('button', { class: 'icon-button', type: 'button', 'aria-label': 'Tắt âm thanh' }, icon('volume_up'));
    this.speedButton = el('button', { class: 'chip-button', type: 'button', 'aria-label': 'Tốc độ chia bài' }, 'x1');
    this.leaveButton = el('button', { class: 'icon-button', type: 'button', 'aria-label': 'Rời bàn' }, icon('logout'));

    const topBar = el('header', { class: 'table-topbar' },
      el('div', { class: 'table-meta' }, this.modeTag, this.infoText),
      el('div', { class: 'table-tools' }, this.speedButton, this.soundButton, this.chatButton, this.leaveButton),
    );

    this.banner = el('div', { class: 'table-banner', hidden: true, role: 'status' });

    this.heroStack = el('strong', { class: 'hero-stack' });
    this.heroHint = el('span', { class: 'hero-hint' });
    this.heroTimer = el('span', { class: 'hero-timer', hidden: true });
    this.heroDock = el('div', { class: 'hero-dock' },
      el('span', { class: 'hero-avatar', 'aria-hidden': 'true' }, 'B'),
      el('div', { class: 'hero-text' }, el('span', { class: 'hero-name' }, 'Bạn'), this.heroStack),
      this.heroHint,
      this.heroTimer,
    );

    this.foldBtn = this.actionButton('fold', 'Bỏ', 'F', () => this.resolve({ type: 'fold' }));
    this.callBtn = this.actionButton('call', 'Theo', 'C', () => this.resolveCall());
    this.raiseBtn = this.actionButton('raise', 'Tố', 'R', () => this.toggleRaise());
    this.allinBtn = this.actionButton('allin', 'Tất tay', 'A', () => this.resolve({ type: 'allin' }));

    this.raiseSlider = el('input', { type: 'range', class: 'raise-slider', min: 0, max: 100, step: 1, 'aria-label': 'Mức tố' });
    this.raiseSlider.addEventListener('input', () => this.syncRaiseLabel());
    this.raiseValue = el('output', { class: 'raise-value' });
    this.raiseConfirm = el('button', { class: 'btn btn-primary raise-confirm', type: 'button', onclick: () => this.confirmRaise() }, 'Tố');
    const preset = (label: string, pick: (c: ActionContext) => number) =>
      el('button', {
        class: 'chip-button',
        type: 'button',
        onclick: () => {
          if (!this.pending) return;
          this.setRaise(pick(this.pending.ctx));
        },
      }, label);
    this.raisePanel = el('div', { class: 'raise-panel', hidden: true },
      el('div', { class: 'raise-presets' },
        preset('Min', (c) => c.legal.minRaiseTo),
        preset('½ Pot', (c) => c.currentBet + Math.round((c.pot + c.legal.toCall) / 2)),
        preset('Pot', (c) => c.currentBet + c.pot + c.legal.toCall),
        preset('Max', (c) => c.legal.maxRaiseTo),
      ),
      el('div', { class: 'raise-row' }, this.raiseSlider, this.raiseValue),
      this.raiseConfirm,
    );

    this.actionBar = el('div', { class: 'action-bar', 'data-testid': 'action-bar', hidden: true },
      this.raisePanel,
      el('div', { class: 'action-buttons' }, this.foldBtn, this.callBtn, this.raiseBtn, this.allinBtn),
    );

    this.root = el('section', { class: 'table-hud', hidden: true, 'aria-label': 'Bàn poker' },
      this.plateLayer,
      this.potLabel,
      topBar,
      this.banner,
      el('div', { class: 'hero-area' }, this.heroDock, this.actionBar),
    );

    window.addEventListener('keydown', this.onKey);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKey);
  }

  get awaitingAction(): boolean {
    return this.pending !== null;
  }

  setVisible(visible: boolean): void {
    this.root.hidden = !visible;
  }

  setup(seats: HudSeat[], heroSeat: number, modeLabel: string): void {
    this.heroSeat = heroSeat;
    this.modeTag.textContent = modeLabel;
    this.modeTag.dataset.mode = modeLabel;
    this.plates = seats.map((seat, i) => {
      const stack = el('span', { class: 'plate-stack' });
      const action = el('span', { class: 'plate-action', hidden: true });
      const hand = el('span', { class: 'plate-hand', hidden: true });
      const timer = el('span', { class: 'plate-timer', hidden: true });
      const bubble = el('span', { class: 'plate-bubble', hidden: true });
      const root = el('div', { class: 'seat-plate', 'data-seat': i },
        bubble,
        el('div', { class: 'plate-main' },
          el('span', { class: 'plate-avatar', 'aria-hidden': 'true' }, initials(seat.name)),
          el('div', { class: 'plate-text' },
            el('span', { class: 'plate-name' },
              seat.name,
              seat.isBot ? el('span', { class: 'tag-bot' }, 'Bot') : null,
              seat.partyMember ? el('span', { class: 'tag-party', title: 'Cùng nhóm' }, icon('group')) : null,
            ),
            stack,
          ),
          el('span', { class: 'plate-dealer', hidden: true }, 'D'),
        ),
        timer,
        action,
        hand,
      );
      return { root, stack, action, hand, timer, bubble, bubbleUntil: 0 };
    });
    replaceChildren(this.plateLayer, ...this.plates.filter((_, i) => i !== heroSeat).map((p) => p.root));
    this.setActor(-1);
    this.cancelAction();
    this.banner.hidden = true;
    this.setPot(0);
  }

  setInfo(text: string): void {
    this.infoText.textContent = text;
  }

  setChatUnread(count: number): void {
    this.chatBadge.hidden = count === 0;
    this.chatBadge.textContent = count > 9 ? '9+' : String(count);
  }

  setSound(on: boolean): void {
    replaceChildren(this.soundButton, icon(on ? 'volume_up' : 'volume_off'));
    this.soundButton.setAttribute('aria-label', on ? 'Tắt âm thanh' : 'Bật âm thanh');
  }

  setSpeed(speed: number): void {
    this.speedButton.textContent = `x${speed}`;
  }

  updateSeat(seat: number, patch: SeatPatch): void {
    const plate = this.plates[seat];
    if (!plate) return;
    if (patch.stack !== undefined) {
      plate.stack.textContent = formatChips(patch.stack);
      if (seat === this.heroSeat) this.heroStack.textContent = formatChips(patch.stack);
    }
    if (patch.action !== undefined) {
      plate.action.hidden = !patch.action;
      plate.action.textContent = patch.action ? (ACTION_LABELS[patch.action] ?? patch.action) : '';
      plate.action.dataset.action = patch.action ?? '';
    }
    if (patch.handName !== undefined) {
      plate.hand.hidden = !patch.handName;
      plate.hand.textContent = patch.handName ?? '';
      if (seat === this.heroSeat && patch.handName) this.heroHint.textContent = patch.handName;
    }
    const flags: (keyof SeatPatch)[] = ['folded', 'allIn', 'busted', 'winner'];
    for (const flag of flags) {
      if (patch[flag] !== undefined) {
        plate.root.classList.toggle(flag, Boolean(patch[flag]));
        if (seat === this.heroSeat) this.heroDock.classList.toggle(flag, Boolean(patch[flag]));
      }
    }
    if (patch.dealer !== undefined) {
      (plate.root.querySelector('.plate-dealer') as HTMLElement).hidden = !patch.dealer;
    }
  }

  setHeroHint(text: string): void {
    this.heroHint.textContent = text;
  }

  setPot(amount: number): void {
    this.potLabel.hidden = amount <= 0;
    this.potLabel.textContent = '';
    this.potLabel.append(el('span', { class: 'pot-caption' }, 'Pot'), el('strong', {}, formatChips(amount)));
  }

  setActor(seat: number, startedAt = 0, duration = 0): void {
    this.actor = seat;
    this.turnStart = startedAt;
    this.turnDuration = duration;
    this.plates.forEach((p, i) => {
      p.root.classList.toggle('acting', i === seat);
      p.timer.hidden = i !== seat || duration <= 0;
    });
    this.heroDock.classList.toggle('acting', seat === this.heroSeat);
    this.heroTimer.hidden = seat !== this.heroSeat || duration <= 0;
  }

  say(seat: number, text: string, now: number): void {
    const plate = this.plates[seat];
    if (!plate || seat === this.heroSeat) return;
    plate.bubble.textContent = text;
    plate.bubble.hidden = false;
    plate.bubbleUntil = now + 3.2;
  }

  showBanner(text: string, tone: 'win' | 'lose' | 'info', now: number, seconds = 2.4): void {
    this.banner.textContent = text;
    this.banner.dataset.tone = tone;
    this.banner.hidden = false;
    this.bannerUntil = now + seconds;
  }

  /** Called every frame with the game clock (seconds) and projected anchors. */
  frame(now: number, project: (seat: number) => ScreenPoint, pot: ScreenPoint): void {
    this.now = now;
    // Measure every plate before writing transforms so layout is read once per frame.
    const viewW = this.root.clientWidth;
    const viewH = this.root.clientHeight;
    const sizes = this.plates.map((plate) => [plate.root.offsetWidth, plate.root.offsetHeight] as const);
    this.plates.forEach((plate, i) => {
      if (i === this.heroSeat) return;
      const p = project(i);
      const [w, h] = sizes[i];
      // Anchor is the plate's bottom centre; keep the whole plate inside the viewport.
      const x = clamp(p.x, w / 2 + EDGE, viewW - w / 2 - EDGE);
      const y = clamp(p.y, h + EDGE + TOP_BAR, viewH - EDGE);
      plate.root.style.visibility = p.visible ? 'visible' : 'hidden';
      plate.root.style.transform = `translate3d(${(x - w / 2).toFixed(1)}px, ${(y - h).toFixed(1)}px, 0)`;
      if (!plate.bubble.hidden && now > plate.bubbleUntil) plate.bubble.hidden = true;
    });
    this.potLabel.style.transform = `translate3d(${pot.x.toFixed(1)}px, ${pot.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    if (!this.banner.hidden && now > this.bannerUntil) this.banner.hidden = true;
    if (this.actor >= 0 && this.turnDuration > 0) {
      const left = Math.max(0, this.turnDuration - (now - this.turnStart));
      const fraction = left / this.turnDuration;
      const target = this.actor === this.heroSeat ? this.heroTimer : this.plates[this.actor]?.timer;
      if (target) {
        target.style.setProperty('--left', fraction.toFixed(3));
        target.textContent = String(Math.ceil(left));
        target.classList.toggle('urgent', left <= 5);
      }
    }
  }

  get clock(): number {
    return this.now;
  }

  requestAction(ctx: ActionContext): Promise<PlayerAction> {
    this.cancelAction();
    const { legal } = ctx;
    this.callBtn.querySelector('.action-label')!.textContent = legal.canCheck ? 'Xem' : `Theo ${formatChips(legal.callAmount)}`;
    this.callBtn.dataset.kind = legal.canCheck ? 'check' : 'call';
    this.foldBtn.disabled = false;
    this.raiseBtn.disabled = !legal.canRaise || legal.minRaiseTo >= legal.maxRaiseTo;
    this.allinBtn.disabled = legal.maxRaiseTo <= ctx.heroBet;
    this.raiseBtn.querySelector('.action-label')!.textContent = ctx.currentBet === 0 ? 'Cược' : 'Tố';
    this.raiseSlider.min = String(legal.minRaiseTo);
    this.raiseSlider.max = String(legal.maxRaiseTo);
    this.raiseSlider.step = String(Math.max(1, Math.floor(ctx.bigBlind / 2)));
    this.setRaise(legal.minRaiseTo);
    this.raisePanel.hidden = true;
    this.actionBar.hidden = false;
    return new Promise((resolve) => {
      this.pending = { resolve, ctx };
    });
  }

  /** Resolve an outstanding request (timeout or leave). */
  cancelAction(fallback?: PlayerAction): void {
    const pending = this.pending;
    this.pending = null;
    this.actionBar.hidden = true;
    this.raisePanel.hidden = true;
    if (pending && fallback) pending.resolve(fallback);
  }

  private resolve(action: PlayerAction): void {
    if (!this.pending) return;
    const { resolve } = this.pending;
    this.cancelAction();
    resolve(action);
  }

  private resolveCall(): void {
    if (!this.pending) return;
    this.resolve({ type: this.pending.ctx.legal.canCheck ? 'check' : 'call' });
  }

  private toggleRaise(): void {
    if (!this.pending || this.raiseBtn.disabled) return;
    this.raisePanel.hidden = !this.raisePanel.hidden;
    if (!this.raisePanel.hidden) this.raiseSlider.focus();
  }

  private confirmRaise(): void {
    if (!this.pending) return;
    const raiseTo = Number(this.raiseSlider.value);
    this.resolve(raiseTo >= this.pending.ctx.legal.maxRaiseTo ? { type: 'allin' } : { type: 'raise', raiseTo });
  }

  private setRaise(value: number): void {
    const min = Number(this.raiseSlider.min);
    const max = Number(this.raiseSlider.max);
    this.raiseSlider.value = String(Math.min(max, Math.max(min, Math.round(value))));
    this.syncRaiseLabel();
  }

  private syncRaiseLabel(): void {
    const value = Number(this.raiseSlider.value);
    const isAll = value >= Number(this.raiseSlider.max);
    this.raiseValue.textContent = formatChips(value);
    this.raiseConfirm.textContent = isAll ? `Tất tay ${formatChips(value)}` : `Tố lên ${formatChips(value)}`;
  }

  private actionButton(kind: string, label: string, key: string, onClick: () => void): HTMLButtonElement {
    return el('button', { class: `action-btn action-${kind}`, type: 'button', 'data-kind': kind, 'aria-keyshortcuts': key, onclick: onClick },
      el('span', { class: 'action-label' }, label),
      el('kbd', { class: 'action-key', 'aria-hidden': 'true' }, key),
    );
  }

  private readonly onKey = (event: KeyboardEvent) => {
    if (!this.pending || this.root.hidden || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && target !== this.raiseSlider))) return;
    if (document.querySelector('.modal-scrim')) return;
    const key = event.key.toLowerCase();
    if (key === 'f') this.resolve({ type: 'fold' });
    else if (key === 'c') this.resolveCall();
    else if (key === 'r') {
      if (!this.raisePanel.hidden) this.confirmRaise();
      else this.toggleRaise();
    } else if (key === 'a' && !this.allinBtn.disabled) this.resolve({ type: 'allin' });
    else if (key === 'enter' && !this.raisePanel.hidden) this.confirmRaise();
    else if (key === 'escape' && !this.raisePanel.hidden) this.raisePanel.hidden = true;
    else return;
    event.preventDefault();
  };
}
