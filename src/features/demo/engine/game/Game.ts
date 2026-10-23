import * as THREE from 'three';
import { Loop } from '../core/Loop';
import { createRenderer, resizeRenderer } from '../core/Renderer';
import { BOT_ROSTER, findBot, type BotProfile } from '../meta/bot-roster';
import { MatchmakingSim, type QueueMode, type QueueStatusResponse } from '../meta/matchmaking-sim';
import { PARTY_ERROR_TEXT, PartyStore, SELF_ID } from '../meta/party-store';
import { ProfileStore, CHECK_IN_REWARD } from '../meta/profile-store';
import { shuffle } from '../poker/cards';
import type { PlayerAction } from '../poker/table-engine';
import { slotsForPlayers } from '../scene/table-layout';
import { TableScene } from '../scene/table-scene';
import { Tweens } from '../scene/tweens';
import { AudioSystem, type SoundName } from '../systems/AudioSystem';
import { DebugTools, type DebugTuning } from '../systems/DebugTools';
import { ChatPanel } from '../ui/chat-panel';
import { el, formatChips, icon, replaceChildren } from '../ui/dom-helpers';
import { LobbyView, NORMAL_ENTRY_FEE, type LeaderRow } from '../ui/lobby-view';
import { MatchResultView } from '../ui/match-result-view';
import { ModalDialog } from '../ui/modal-dialog';
import { NotificationCenter } from '../ui/notification-center';
import { QueueView } from '../ui/queue-view';
import { TableHud, type ActionContext, type ScreenPoint } from '../ui/table-hud';
import { createSeededRandom } from '../utils/random';
import { MatchRunner, type BotMoment, type MatchConfig, type MatchOutcome, type MatchSeat } from './match-runner';

type Screen = 'lobby' | 'table' | 'result';
type Delayed = { at: number; run: () => void };

const STARTING_STACK = 1500;
const TEST_STATES = ['lobby', 'queue', 'proposed', 'table', 'showdown', 'match-end'] as const;

/**
 * Orchestrator: owns the render loop, the two clocks (real for queue and turn
 * timers, tween clock for table animation) and routes between lobby, queue,
 * table and result screens.
 */
export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  private readonly tweens = new Tweens();
  private readonly table: TableScene;
  private readonly audio = new AudioSystem();
  private readonly profile = new ProfileStore();
  private readonly loop = new Loop(
    (delta) => this.update(delta),
    () => this.render(),
  );
  private readonly tuning: DebugTuning = { exposure: 1.05, maxDpr: 2, speed: 1 };
  private readonly debugTools: DebugTools;

  // Route ALL gameplay randomness through this.rng (never Math.random) so the
  // seed() test hook keeps screenshot baselines and bot playtests deterministic.
  private rng = createSeededRandom(20261022);
  private readonly rand = () => this.rng();
  private readonly matchmaking = new MatchmakingSim(this.rand);
  private readonly party = new PartyStore(this.rand);

  private readonly uiRoot: HTMLElement;
  private readonly appBar: HTMLElement;
  private readonly coinChip: HTMLElement;
  private readonly notifications: NotificationCenter;
  private readonly modal: ModalDialog;
  private readonly lobby: LobbyView;
  private readonly queue: QueueView;
  private readonly hud = new TableHud();
  private readonly chat = new ChatPanel(SELF_ID);
  private readonly result: MatchResultView;

  private screen: Screen = 'lobby';
  private queueMinimized = false;
  private runner: MatchRunner | null = null;
  private lastMode: QueueMode = 'NORMAL';
  private heroPolicy: ((ctx: ActionContext) => PlayerAction) | undefined;
  private showdownSeen = false;
  private delayed: Delayed[] = [];
  private frame = 0;
  private clock = 0;
  private pausedForScreenshot = false;
  // Set while test hooks fast-forward: the frame loop neither advances nor renders.
  private fastForwarding = false;
  private reducedMotion = false;
  private readonly projected = new THREE.Vector3();

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = this.tuning.exposure;
    this.table = new TableScene(this.scene, this.camera, this.tweens);
    this.debugTools = new DebugTools(this.tuning, () => {
      this.renderer.toneMappingExposure = this.tuning.exposure;
      this.setSpeed(this.tuning.speed);
      resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    });

    this.uiRoot = this.getElement('#ui-root');
    const toastHost = this.getElement('#toast-host');
    this.modal = new ModalDialog(this.getElement('#modal-host'));
    this.notifications = new NotificationCenter(toastHost);

    this.coinChip = el('span', { class: 'coin-chip', 'aria-label': 'Số xu' });
    const soundToggle = el('button', { class: 'icon-button', type: 'button', onclick: () => this.toggleSound() });
    this.appBar = el('header', { class: 'app-bar' },
      el('div', { class: 'brand' }, el('span', { class: 'brand-mark', 'aria-hidden': 'true' }, '♠'), el('span', { class: 'brand-name' }, 'Poker Tím'), el('span', { class: 'brand-3d' }, '3D')),
      el('div', { class: 'app-tools' }, this.coinChip, soundToggle, this.notifications.button),
      this.notifications.element,
    );

    this.lobby = new LobbyView({
      checkIn: () => this.checkIn(),
      playRank: () => this.joinQueue('RANK'),
      playNormal: () => this.joinQueue('NORMAL'),
      resumeQueue: () => this.showQueue(true),
      createParty: () => {
        this.party.create(this.nowMs);
        this.notifications.toast('Đã tạo nhóm', 'Mời bạn bè rồi bấm Chơi nhanh để cả nhóm vào bàn.', 'groups');
      },
      copyCode: (code) => void this.copyCode(code),
      invite: (botId) => this.partyAction(this.party.invite(botId, this.nowMs), `Đã gửi lời mời tới ${findBot(botId)?.name ?? ''}`),
      kick: (id) => this.partyAction(this.party.kick(id), `${findBot(id)?.name ?? 'Thành viên'} đã rời nhóm`),
      leaveParty: () => this.partyAction(this.party.leave(), 'Bạn đã rời nhóm'),
    });
    this.queue = new QueueView({
      leave: () => {
        if (this.matchmaking.leave()) this.notifications.toast('Đã hủy tìm trận');
      },
      accept: () => this.matchmaking.accept(this.nowMs),
      decline: () => {
        this.matchmaking.decline();
        this.notifications.toast('Đã từ chối trận Rank');
      },
      minimize: () => this.showQueue(false),
      reload: () => this.matchmaking.reset(),
      backToLobby: () => {
        this.matchmaking.reset();
        this.showQueue(false);
      },
    });
    this.result = new MatchResultView(
      () => this.playAgain(),
      () => this.goToLobby(),
    );

    this.chat.onSend = (content, clientMessageId) => this.sendChat(content, clientMessageId);
    this.chat.onToggle = (open) => {
      this.hud.setChatUnread(this.chat.unreadCount);
      this.hud.root.classList.toggle('chat-open', open);
    };
    this.hud.chatButton.addEventListener('click', () => this.chat.setOpen(!this.chat.isOpen));
    this.hud.soundButton.addEventListener('click', () => this.toggleSound());
    this.hud.speedButton.addEventListener('click', () => this.setSpeed(this.tweens.speed === 1 ? 2 : 1));
    this.hud.leaveButton.addEventListener('click', () => this.confirmLeave());

    replaceChildren(this.uiRoot, this.appBar, this.lobby.root, this.queue.root, this.hud.root, this.chat.root, this.result.root);
    this.renderSoundToggle(soundToggle);
    this.profile.subscribe(() => {
      this.renderSoundToggle(soundToggle);
      this.renderLobby();
    });
    this.party.subscribe(() => this.renderLobby());
    this.matchmaking.subscribe((s) => this.onQueueStatus(s));
    this.audio.enabled = this.profile.value.soundOn;
    this.hud.setSound(this.profile.value.soundOn);

    this.setScreen('lobby');
    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    this.installTestHooks();
    this.publishDiagnostics();
  }

  start(): void {
    this.loop.start();
  }

  /** Public local-only entry: exactly one human seat, filled out by five bots. */
  startSoloDemo(): void {
    if (this.screen !== 'lobby') return;
    if (this.profile.value.coins < NORMAL_ENTRY_FEE) this.profile.update({ coins: 2000 });
    this.startMatch('NORMAL', `solo-demo-${crypto.randomUUID()}`, 6);
  }

  dispose(): void {
    this.loop.stop();
    this.runner?.abort();
    this.hud.dispose();
    this.audio.dispose();
    this.debugTools.dispose();
    this.modal.close();
    this.renderer.dispose();
    this.uiRoot.replaceChildren();
    window.__THREE_GAME_DIAGNOSTICS__ = undefined;
    window.__THREE_GAME_TEST_HOOKS__ = undefined;
  }

  private get nowMs(): number {
    return this.clock * 1000;
  }

  // ---------------------------------------------------------------- loop

  private update(delta: number): void {
    this.frame += 1;
    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    if (!this.pausedForScreenshot && !this.fastForwarding) this.advance(delta);
    this.layoutHud();
    this.queue.tick(this.nowMs);
    this.publishDiagnostics();
  }

  /** One simulation step; also used by test hooks to fast-forward deterministically. */
  private advance(delta: number): void {
    this.clock += delta;
    this.tweens.update(delta);
    this.runner?.tickReal(this.clock);
    this.matchmaking.tick(this.nowMs);
    for (const botId of this.party.tick(this.nowMs)) {
      const bot = findBot(botId);
      this.notifications.push({ type: 'PARTY_JOINED', title: 'Có người vào nhóm', body: `${bot?.name ?? botId} (Bot) đã vào nhóm bằng mã mời.` });
    }
    if (this.delayed.length) {
      const due = this.delayed.filter((d) => d.at <= this.clock);
      this.delayed = this.delayed.filter((d) => d.at > this.clock);
      for (const d of due) d.run();
    }
    this.table.update(delta, this.clock, this.reducedMotion);
  }

  private render(): void {
    if (this.fastForwarding) return;
    this.renderer.render(this.scene, this.camera);
  }

  private layoutHud(): void {
    if (this.screen === 'lobby') return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const project = (point: THREE.Vector3): ScreenPoint => {
      this.projected.copy(point).project(this.camera);
      return {
        x: ((this.projected.x + 1) / 2) * width,
        y: ((1 - this.projected.y) / 2) * height,
        visible: this.projected.z < 1,
      };
    };
    this.hud.frame(this.clock, (seat) => project(this.table.labelAnchor(seat)), project(this.table.potAnchor()));
  }

  // ---------------------------------------------------------------- screens

  private setScreen(screen: Screen): void {
    this.screen = screen;
    this.lobby.setVisible(screen === 'lobby');
    this.appBar.hidden = screen !== 'lobby';
    this.hud.setVisible(screen !== 'lobby');
    this.chat.root.hidden = screen === 'lobby';
    if (screen !== 'result') this.result.hide();
    this.table.setView(screen === 'lobby' ? 'lobby' : 'table');
    this.queue.setVisible(screen === 'lobby' && this.matchmaking.snapshot.status !== 'NONE' && !this.queueMinimized);
    document.body.dataset.screen = screen;
    this.renderLobby();
  }

  private showQueue(visible: boolean): void {
    this.queueMinimized = !visible;
    this.queue.setVisible(visible && this.screen === 'lobby' && this.matchmaking.snapshot.status !== 'NONE');
    this.renderLobby();
    if (!visible) this.lobby.root.querySelector<HTMLElement>('[data-key="resume"]')?.focus();
  }

  private renderLobby(): void {
    const p = this.profile.value;
    this.coinChip.replaceChildren(icon('paid'), formatChips(p.coins));
    const s = this.matchmaking.snapshot;
    const leaderboard: LeaderRow[] = [
      { id: SELF_ID, name: p.name, rp: p.rp, isSelf: true },
      ...BOT_ROSTER.map((b) => ({ id: b.id, name: b.name, rp: b.rp + (p.botRp[b.id] ?? 0), isSelf: false })),
    ];
    this.lobby.render({
      profile: p,
      party: this.party.party,
      isLeader: this.party.isLeader,
      partyLocked: this.party.locked,
      isPending: (id) => this.party.isPending(id),
      queueActive: s.status !== 'NONE',
      queueLabel: `${s.mode === 'RANK' ? 'Đấu hạng' : 'Chơi thường'} · ${queueStatusLabel(s)}`,
      canCheckIn: this.profile.canCheckIn(),
      leaderboard,
    });
  }

  // ---------------------------------------------------------------- lobby actions

  private checkIn(): void {
    if (!this.profile.checkIn()) return;
    this.sound('win');
    this.notifications.push({ type: 'DAILY_REWARD', title: 'Điểm danh thành công', body: `+${CHECK_IN_REWARD} xu đã vào tài khoản.` });
  }

  private partyAction(error: keyof typeof PARTY_ERROR_TEXT | null, success: string): void {
    if (error) this.notifications.toast('Không thực hiện được', PARTY_ERROR_TEXT[error], 'error', 'error');
    else this.notifications.toast(success, '', 'group');
  }

  private async copyCode(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      this.notifications.toast('Đã sao chép mã nhóm', code, 'content_copy', 'success');
    } catch {
      this.notifications.toast('Không sao chép được', `Mã nhóm: ${code}`, 'content_copy');
    }
  }

  private joinQueue(mode: QueueMode): void {
    if (this.matchmaking.snapshot.status !== 'NONE') {
      this.showQueue(true);
      return;
    }
    if (mode === 'RANK' && this.party.party) {
      this.notifications.toast('Không thể vào Rank', 'Rank chỉ chơi đơn. Hãy rời nhóm trước.', 'error', 'error');
      return;
    }
    if (mode === 'NORMAL' && this.profile.value.coins < NORMAL_ENTRY_FEE) {
      this.notifications.toast('Không đủ xu', `Cần ${NORMAL_ENTRY_FEE} xu để vào bàn thường.`, 'error', 'error');
      return;
    }
    if (mode === 'NORMAL' && this.party.party && !this.party.isLeader) {
      this.notifications.toast('Chỉ trưởng nhóm được bắt đầu', '', 'error', 'error');
      return;
    }
    this.lastMode = mode;
    this.party.locked = this.party.party !== null;
    this.queueMinimized = false;
    this.sound('click');
    this.matchmaking.join(mode, this.party.party?.memberIds.length ?? 1, this.nowMs);
  }

  private onQueueStatus(s: QueueStatusResponse): void {
    this.queue.render(s, this.nowMs);
    if (s.status === 'NONE' || s.status === 'FAILED') this.party.locked = false;
    if (s.status === 'PROPOSED' && !s.accepted) {
      this.sound('match');
      this.notifications.push({ eventId: s.proposalId ?? undefined, type: 'MATCH_FOUND', title: 'Đã tìm thấy trận Rank', body: 'Xác nhận trong 10 giây để vào bàn.' });
      this.queueMinimized = false;
    }
    if (s.status === 'FAILED') this.notifications.toast('Tìm trận thất bại', s.failReason ?? '', 'error', 'error');
    if (s.status === 'READY' && this.screen === 'lobby') {
      this.notifications.push({ eventId: s.matchId ?? undefined, type: 'MATCH_READY', title: 'Bàn đã sẵn sàng', body: `${s.playerCount ?? 4} người · ${s.mode === 'RANK' ? 'Đấu hạng' : 'Chơi thường'}` }, false);
      this.startMatch(s.mode ?? 'NORMAL', s.matchId ?? 'local', s.playerCount ?? 4);
      return;
    }
    if (this.screen === 'lobby') {
      this.queue.setVisible(s.status !== 'NONE' && !this.queueMinimized);
      this.renderLobby();
    }
  }

  // ---------------------------------------------------------------- match

  private startMatch(mode: QueueMode, matchId: string, playerCount: number): void {
    this.runner?.abort();
    const count = Math.max(2, Math.min(6, playerCount));
    const partyBots = mode === 'NORMAL' ? this.party.botMembers().map((id) => findBot(id)!).filter(Boolean) : [];
    const strangers = shuffle(BOT_ROSTER.filter((b) => !partyBots.includes(b)), this.rng);
    const bots: { bot: BotProfile; party: boolean }[] = [
      ...partyBots.map((bot) => ({ bot, party: true })),
      ...strangers.map((bot) => ({ bot, party: false })),
    ].slice(0, count - 1);
    const seats: MatchSeat[] = [
      { id: SELF_ID, name: this.profile.value.name, isHuman: true, bot: null, partyMember: partyBots.length > 0 },
      ...bots.map(({ bot, party }) => ({ id: bot.id, name: bot.name, isHuman: false, bot, partyMember: party })),
    ];
    if (mode === 'NORMAL') this.profile.update({ coins: this.profile.value.coins - NORMAL_ENTRY_FEE });

    const config: MatchConfig = { mode, matchId, seats, startingStack: STARTING_STACK };
    this.table.setupPlayers(seats.map((s) => s.bot?.avatar ?? null), slotsForPlayers(seats.length));
    this.hud.setup(
      seats.map((s) => ({ name: s.name, isHuman: s.isHuman, isBot: s.bot !== null, partyMember: s.partyMember && !s.isHuman })),
      0,
      mode === 'RANK' ? 'Đấu hạng' : 'Chơi thường',
    );
    this.chat.reset(`Chat bàn · ${seats.length} người`);
    this.chat.system(`Bàn ${matchId} bắt đầu. Mỗi người ${formatChips(STARTING_STACK)} chip, mù tăng sau mỗi 6 ván.`);
    this.chat.setOpen(false);
    this.showdownSeen = false;

    const game = this;
    const runner = new MatchRunner(config, this.table, this.hud, this.tweens, this.rand, {
      sound: (name) => this.sound(name),
      botLine: (seat, moment) => this.botSay(config, seat, moment),
      system: (text) => this.chat.system(text),
      // Only set while a test autopilot drives the human seat.
      get heroPolicy() {
        return game.heroPolicy;
      },
      onShowdown: () => {
        this.showdownSeen = true;
      },
    });
    this.runner = runner;
    this.setScreen('table');
    this.table.enterTable(this.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 3.2);
    this.sound('match');
    void runner.run().then((outcome) => {
      if (this.runner === runner) this.finishMatch(config, outcome);
    });
  }

  private finishMatch(config: MatchConfig, outcome: MatchOutcome): void {
    this.runner = null;
    const p = this.profile.value;
    const n = outcome.playerCount;
    const placement = Math.max(1, Math.min(n, outcome.placement || n));
    let rpDelta = 0;
    let coinDelta = 0;
    const botRp = { ...p.botRp };
    if (config.mode === 'RANK') {
      rpDelta = Math.round(30 - ((placement - 1) * 48) / Math.max(1, n - 1));
      for (const seat of config.seats) {
        if (!seat.bot) continue;
        const out = outcome.eliminated.indexOf(seat.id);
        botRp[seat.id] = (botRp[seat.id] ?? 0) + (out === -1 ? 6 : out < 2 ? -6 : 2);
      }
    } else {
      const pool = NORMAL_ENTRY_FEE * n;
      const payout = outcome.aborted ? 0 : placement === 1 ? Math.round(pool * 0.65) : placement === 2 ? Math.round(pool * 0.35) : 0;
      coinDelta = payout - NORMAL_ENTRY_FEE;
      if (payout) this.profile.update({ coins: this.profile.value.coins + payout });
    }
    this.profile.update({
      matches: p.matches + 1,
      wins: p.wins + (placement === 1 && !outcome.aborted ? 1 : 0),
      rp: Math.max(0, p.rp + rpDelta),
      botRp,
    });
    this.matchmaking.reset();
    this.party.locked = false;
    this.chat.setReadOnly('Trận đã kết thúc — chat chỉ đọc');
    this.hud.setActor(-1);
    this.table.setActor(-1);
    const winner = outcome.winnerId ? config.seats.find((s) => s.id === outcome.winnerId) : null;
    const leaderName = winner?.name ?? null;
    this.notifications.push({
      type: 'MATCH_RESULT',
      title: placement === 1 && !outcome.aborted ? 'Vô địch bàn!' : `Kết thúc trận · hạng ${placement}/${n}`,
      body: config.mode === 'RANK' ? `${rpDelta >= 0 ? '+' : ''}${rpDelta} RP` : `${coinDelta >= 0 ? '+' : ''}${formatChips(coinDelta)} xu`,
    }, false);
    if (placement === 1 && !outcome.aborted) this.sound('win');
    this.screen = 'result';
    document.body.dataset.screen = 'result';
    this.result.show({
      mode: config.mode,
      placement,
      playerCount: n,
      hands: outcome.hands,
      biggestPot: outcome.biggestPot,
      rpDelta,
      coinDelta,
      aborted: outcome.aborted,
      winnerName: placement === 1 ? null : leaderName,
    });
  }

  private confirmLeave(): void {
    if (!this.runner) {
      this.goToLobby();
      return;
    }
    this.modal.open({
      title: 'Rời bàn?',
      body: el('p', {}, this.runner.config.mode === 'RANK'
        ? 'Trận Rank vẫn tính hạng: bạn sẽ nhận hạng thấp nhất trong số người còn ngồi.'
        : 'Phí vào bàn không được hoàn lại.'),
      actions: [
        { label: 'Ở lại', variant: 'secondary', onClick: () => undefined },
        { label: 'Rời bàn', variant: 'danger', onClick: () => this.runner?.abort() },
      ],
    });
  }

  private goToLobby(): void {
    this.runner?.abort();
    this.runner = null;
    this.table.clearHand();
    this.table.layoutChips([], [], 0);
    this.chat.setOpen(false);
    this.setScreen('lobby');
  }

  private playAgain(): void {
    this.goToLobby();
    this.joinQueue(this.lastMode);
  }

  // ---------------------------------------------------------------- chat & feedback

  private botSay(config: MatchConfig, seat: number, moment: BotMoment | 'reply'): void {
    const bot = config.seats[seat]?.bot;
    if (!bot) return;
    const lines = bot.lines[moment];
    const text = lines[Math.floor(this.rng() * lines.length)];
    const id = `bot-${seat}-${this.frame}-${Math.floor(this.rng() * 1e6)}`;
    this.chat.upsert({ id, clientMessageId: id, senderId: bot.id, senderName: bot.name, content: text, createdAt: Date.now(), status: 'sent' });
    this.hud.say(seat, text, this.clock);
    this.hud.setChatUnread(this.chat.unreadCount);
  }

  private sendChat(content: string, clientMessageId: string): void {
    const runner = this.runner;
    this.chat.upsert({ id: clientMessageId, clientMessageId, senderId: SELF_ID, senderName: this.profile.value.name, content, createdAt: Date.now(), status: 'pending' });
    this.delayed.push({ at: this.clock + 0.25, run: () => this.chat.upsert({ id: clientMessageId, clientMessageId, senderId: SELF_ID, senderName: this.profile.value.name, content, createdAt: Date.now(), status: 'sent' }) });
    if (!runner || this.rng() > 0.55) return;
    const bots = runner.config.seats.map((s, i) => ({ s, i })).filter(({ s, i }) => s.bot && !runner.engine.seats[i].busted);
    if (!bots.length) return;
    const pick = bots[Math.floor(this.rng() * bots.length)];
    this.delayed.push({ at: this.clock + 1.2 + this.rng() * 1.6, run: () => this.runner === runner && this.botSay(runner.config, pick.i, 'reply') });
  }

  private sound(name: SoundName): void {
    this.audio.play(name);
  }

  private toggleSound(): void {
    const on = !this.profile.value.soundOn;
    this.audio.enabled = on;
    this.profile.update({ soundOn: on });
    this.hud.setSound(on);
  }

  private renderSoundToggle(button: HTMLButtonElement): void {
    const on = this.profile.value.soundOn;
    button.replaceChildren(icon(on ? 'volume_up' : 'volume_off'));
    button.setAttribute('aria-label', on ? 'Tắt âm thanh' : 'Bật âm thanh');
  }

  private setSpeed(speed: number): void {
    this.tweens.speed = speed;
    this.tuning.speed = speed;
    this.hud.setSpeed(speed);
  }

  // ---------------------------------------------------------------- test hooks

  private installTestHooks(): void {
    // Deterministic hooks for visual checks and bot playtests. Each state is
    // reached by really playing the flow (fast-forwarded on the game clock),
    // never by painting a fake screen.
    window.__THREE_GAME_TEST_HOOKS__ = {
      seed: (value: number) => {
        this.rng = createSeededRandom(value);
      },
      setState: async (name: string) => {
        if (!(TEST_STATES as readonly string[]).includes(name)) throw new Error(`Unknown test state: ${name}`);
        await this.enterTestState(name as (typeof TEST_STATES)[number]);
        this.render();
        this.publishDiagnostics();
        return { state: name };
      },
      setPausedForScreenshot: (paused: boolean) => {
        this.pausedForScreenshot = paused;
      },
      setReducedMotion: (enabled: boolean) => {
        this.reducedMotion = enabled;
        this.table.update(0, this.clock, enabled);
        this.render();
        this.publishDiagnostics();
      },
      hideDebugUi: (hidden: boolean) => {
        this.debugTools.setHidden(hidden);
      },
    };
  }

  private async enterTestState(name: (typeof TEST_STATES)[number]): Promise<void> {
    this.heroPolicy = undefined;
    this.modal.close();
    this.goToLobby();
    this.matchmaking.reset();
    this.party.locked = false;
    this.party.leave();
    if (this.profile.value.coins < NORMAL_ENTRY_FEE) this.profile.update({ coins: 2000 });
    await this.pump(() => true, 0.1);
    if (name === 'lobby') return;
    if (name === 'queue') {
      this.joinQueue('NORMAL');
      await this.pump(() => (this.matchmaking.snapshot.playerCount ?? 0) >= 3, 10);
      return;
    }
    if (name === 'proposed') {
      this.joinQueue('RANK');
      await this.pump(() => this.matchmaking.snapshot.status === 'PROPOSED', 30, 0.25);
      return;
    }
    if (name === 'showdown') this.heroPolicy = (ctx) => (ctx.legal.canCheck ? { type: 'check' } : { type: 'call' });
    if (name === 'match-end') this.heroPolicy = () => ({ type: 'allin' });
    this.startMatch('RANK', 'match-test', 6);
    if (name === 'table') {
      await this.pump(() => this.hud.awaitingAction, 60);
    } else if (name === 'showdown') {
      await this.pump(() => this.showdownSeen, 600, 0.2);
      await this.pump(() => false, 1.6);
      this.heroPolicy = (ctx) => (ctx.legal.canCheck ? { type: 'check' } : { type: 'fold' });
    } else {
      await this.pump(() => this.screen === 'result', 1800, 0.25);
    }
  }

  private async pump(until: () => boolean, maxSeconds: number, step = 0.1): Promise<void> {
    this.fastForwarding = true;
    try {
      for (let t = 0; t <= maxSeconds; t += step) {
        if (until()) return;
        this.advance(step);
        this.layoutHud();
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    } finally {
      this.fastForwarding = false;
    }
  }

  private publishDiagnostics(): void {
    const info = this.renderer.info;
    const engine = this.runner?.engine;
    window.__THREE_GAME_DIAGNOSTICS__ = {
      frame: this.frame,
      elapsed: this.clock,
      screen: this.screen,
      queueStatus: this.matchmaking.snapshot.status,
      table: engine
        ? {
            handNo: engine.handNo,
            street: engine.street,
            pot: engine.potTotal,
            heroStack: engine.seats[0].stack,
            playersLeft: engine.playersWithChips.length,
            awaitingHero: this.hud.awaitingAction,
            speed: this.tweens.speed,
          }
        : null,
      renderer: {
        calls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
      },
      canvas: {
        clientWidth: this.canvas.clientWidth,
        clientHeight: this.canvas.clientHeight,
        width: this.canvas.width,
        height: this.canvas.height,
        dpr: Math.min(window.devicePixelRatio || 1, this.tuning.maxDpr),
      },
    };
  }

  private getElement(selector: string): HTMLElement {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing element: ${selector}`);
    return element;
  }
}

function queueStatusLabel(s: QueueStatusResponse): string {
  switch (s.status) {
    case 'WAITING':
      return `Đang chờ · ${s.playerCount ?? 1}/${s.maxPlayers}`;
    case 'COUNTDOWN':
      return 'Sắp bắt đầu';
    case 'MATCHING':
      return 'Đang ghép bàn';
    case 'PROPOSED':
      return s.accepted ? 'Đã chấp nhận' : 'Chờ bạn xác nhận';
    case 'CREATING_TABLE':
      return 'Đang tạo bàn';
    case 'FAILED':
      return 'Thất bại';
    default:
      return '';
  }
}
