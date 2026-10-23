/**
 * Local stand-in for matchmaking-service. It walks the exact status table of
 * the requirement (NONE → WAITING → COUNTDOWN → MATCHING → [PROPOSED] →
 * CREATING_TABLE → READY | FAILED) and exposes a QueueStatusResponse-shaped
 * snapshot, so the queue UI is written against the real contract.
 * Time comes from the game clock (tick), never from wall-clock timers.
 */
export type QueueMode = 'RANK' | 'NORMAL';
export type QueueStatus =
  | 'NONE'
  | 'WAITING'
  | 'COUNTDOWN'
  | 'MATCHING'
  | 'PROPOSED'
  | 'CREATING_TABLE'
  | 'READY'
  | 'FAILED';

export type QueueStatusResponse = {
  status: QueueStatus;
  mode: QueueMode | null;
  joinedAt: number | null;
  position: number | null;
  playerCount: number | null;
  minPlayers: number;
  maxPlayers: number;
  matchStartDeadline: number | null;
  acceptDeadline: number | null;
  proposalId: string | null;
  tableId: string | null;
  matchId: string | null;
  /** Local-only: the player already accepted the Rank proposal. */
  accepted: boolean;
  failReason: string | null;
};

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 6;
const COUNTDOWN_MS = 5000;
const ACCEPT_WINDOW_MS = 10000;

export class MatchmakingSim {
  private state: QueueStatusResponse = emptyStatus();
  private nextEventAt = 0;
  private listeners = new Set<(s: QueueStatusResponse) => void>();

  constructor(private readonly rng: () => number) {}

  get snapshot(): QueueStatusResponse {
    return this.state;
  }

  get active(): boolean {
    return this.state.status !== 'NONE' && this.state.status !== 'FAILED';
  }

  subscribe(listener: (s: QueueStatusResponse) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  join(mode: QueueMode, partySize: number, now: number): void {
    if (this.active) return; // UI shows "Quay lại tìm trận" instead of re-joining.
    this.set({
      ...emptyStatus(),
      status: 'WAITING',
      mode,
      joinedAt: now,
      position: 2 + Math.floor(this.rng() * 4),
      playerCount: Math.max(1, partySize),
    });
    this.nextEventAt = now + this.jitter(500, 900);
  }

  /** Mirrors "Hủy khi backend cho phép": only before the match is locked. */
  canLeave(): boolean {
    return this.state.status === 'WAITING' || this.state.status === 'COUNTDOWN';
  }

  leave(): boolean {
    if (!this.canLeave()) return false;
    this.set(emptyStatus());
    return true;
  }

  accept(now: number): void {
    if (this.state.status !== 'PROPOSED' || this.state.accepted) return;
    if (this.state.acceptDeadline !== null && now > this.state.acceptDeadline) return;
    this.set({ ...this.state, accepted: true });
    this.nextEventAt = now + this.jitter(900, 1600);
  }

  decline(): void {
    if (this.state.status !== 'PROPOSED') return;
    this.set(emptyStatus());
  }

  /** Clears READY/FAILED after the UI consumed them ("tải lại trạng thái"). */
  reset(): void {
    this.set(emptyStatus());
  }

  tick(now: number): void {
    const s = this.state;
    switch (s.status) {
      case 'WAITING':
      case 'COUNTDOWN': {
        if (now >= this.nextEventAt && (s.playerCount ?? 0) < MAX_PLAYERS) {
          const position = s.position && s.position > 1 ? s.position - 1 : s.position;
          const playerCount = (s.playerCount ?? 0) + 1;
          const reachedMin = playerCount >= MIN_PLAYERS;
          this.set({
            ...s,
            position,
            playerCount,
            status: reachedMin ? 'COUNTDOWN' : 'WAITING',
            matchStartDeadline: reachedMin ? (s.matchStartDeadline ?? now + COUNTDOWN_MS) : null,
          });
          this.nextEventAt = now + this.jitter(700, 1500);
        }
        const current = this.state;
        const full = (current.playerCount ?? 0) >= MAX_PLAYERS;
        if (current.status === 'COUNTDOWN' && (full || (current.matchStartDeadline ?? Infinity) <= now)) {
          this.set({ ...current, status: 'MATCHING', position: null });
          this.nextEventAt = now + this.jitter(700, 1100);
        }
        break;
      }
      case 'MATCHING':
        if (now < this.nextEventAt) break;
        if (s.mode === 'RANK') {
          this.set({ ...s, status: 'PROPOSED', proposalId: makeId('prop', this.rng), acceptDeadline: now + ACCEPT_WINDOW_MS });
          this.nextEventAt = Infinity;
        } else {
          this.set({ ...s, status: 'CREATING_TABLE' });
          this.nextEventAt = now + this.jitter(900, 1300);
        }
        break;
      case 'PROPOSED':
        if (!s.accepted && s.acceptDeadline !== null && now > s.acceptDeadline) {
          this.set({ ...s, status: 'FAILED', failReason: 'Hết thời gian xác nhận trận Rank.' });
        } else if (s.accepted && now >= this.nextEventAt) {
          this.set({ ...s, status: 'CREATING_TABLE' });
          this.nextEventAt = now + this.jitter(900, 1300);
        }
        break;
      case 'CREATING_TABLE':
        if (now >= this.nextEventAt) {
          this.set({ ...s, status: 'READY', tableId: makeId('tbl', this.rng), matchId: makeId('match', this.rng) });
        }
        break;
      default:
        break;
    }
  }

  private jitter(min: number, max: number): number {
    return min + this.rng() * (max - min);
  }

  private set(next: QueueStatusResponse): void {
    this.state = next;
    for (const listener of this.listeners) listener(next);
  }
}

function emptyStatus(): QueueStatusResponse {
  return {
    status: 'NONE',
    mode: null,
    joinedAt: null,
    position: null,
    playerCount: null,
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
    matchStartDeadline: null,
    acceptDeadline: null,
    proposalId: null,
    tableId: null,
    matchId: null,
    accepted: false,
    failReason: null,
  };
}

function makeId(prefix: string, rng: () => number): string {
  return `${prefix}-${Math.floor(rng() * 0xffffff).toString(16).padStart(6, '0')}`;
}
