/**
 * Local player profile. Browser storage can be missing or throw (private mode,
 * blocked site data), so every read/write is guarded and the game works with
 * an in-memory profile when persistence is unavailable.
 */
export type PlayerProfile = {
  name: string;
  coins: number;
  rp: number;
  matches: number;
  wins: number;
  /** ISO date (yyyy-mm-dd) of the last daily check-in. */
  lastCheckIn: string | null;
  /** Bot id → RP drift from playing against them, so the leaderboard moves. */
  botRp: Record<string, number>;
  soundOn: boolean;
};

const STORAGE_KEY = 'poker-rank:solo-demo:profile:v1';

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Bạn',
  coins: 2000,
  rp: 1200,
  matches: 0,
  wins: 0,
  lastCheckIn: null,
  botRp: {},
  soundOn: true,
};

export const CHECK_IN_REWARD = 300;

export class ProfileStore {
  private profile: PlayerProfile;
  private listeners = new Set<(p: PlayerProfile) => void>();

  constructor() {
    this.profile = { ...DEFAULT_PROFILE, ...this.read() };
  }

  get value(): PlayerProfile {
    return this.profile;
  }

  update(patch: Partial<PlayerProfile>): void {
    this.profile = { ...this.profile, ...patch };
    this.write();
    for (const listener of this.listeners) listener(this.profile);
  }

  subscribe(listener: (p: PlayerProfile) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  canCheckIn(today = todayIso()): boolean {
    return this.profile.lastCheckIn !== today;
  }

  checkIn(today = todayIso()): boolean {
    if (!this.canCheckIn(today)) return false;
    this.update({ lastCheckIn: today, coins: this.profile.coins + CHECK_IN_REWARD });
    return true;
  }

  private read(): Partial<PlayerProfile> {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Partial<PlayerProfile>) : {};
    } catch {
      return {};
    }
  }

  private write(): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch {
      // Persistence unavailable; keep playing with the in-memory profile.
    }
  }
}

export function todayIso(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
