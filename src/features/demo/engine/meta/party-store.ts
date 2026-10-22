import { BOT_ROSTER } from './bot-roster';

/** PartyResponse shape from the requirement: partyId, partyCode, leaderId, memberIds, createdAt. */
export type Party = {
  partyId: string;
  partyCode: string;
  leaderId: string;
  memberIds: string[];
  createdAt: number;
};

export const SELF_ID = 'self';
export const PARTY_MAX = 6;
const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export type PartyError = 'not-leader' | 'full' | 'already-member' | 'queue-locked' | 'no-party';

/**
 * Party for Normal games. Invites go to bot friends, who "join by code" after a
 * short delay — the same invite → join-by-code flow the requirement describes.
 */
export class PartyStore {
  party: Party | null = null;
  /** Bot ids invited but not yet joined, with the game time they will join. */
  private pending = new Map<string, number>();
  private listeners = new Set<() => void>();
  locked = false;

  constructor(private readonly rng: () => number) {}

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get isLeader(): boolean {
    return this.party?.leaderId === SELF_ID;
  }

  isPending(botId: string): boolean {
    return this.pending.has(botId);
  }

  create(now: number): Party {
    if (this.party) return this.party;
    let code = '';
    for (let i = 0; i < 8; i += 1) code += CODE_ALPHABET[Math.floor(this.rng() * CODE_ALPHABET.length)];
    this.party = { partyId: `party-${code.toLowerCase()}`, partyCode: code, leaderId: SELF_ID, memberIds: [SELF_ID], createdAt: now };
    this.emit();
    return this.party;
  }

  invite(botId: string, now: number): PartyError | null {
    const error = this.guardMutation();
    if (error) return error;
    const party = this.party!;
    if (party.memberIds.includes(botId) || this.pending.has(botId)) return 'already-member';
    if (party.memberIds.length + this.pending.size >= PARTY_MAX) return 'full';
    this.pending.set(botId, now + 1200 + this.rng() * 1800);
    this.emit();
    return null;
  }

  kick(memberId: string): PartyError | null {
    const error = this.guardMutation();
    if (error) return error;
    this.party = { ...this.party!, memberIds: this.party!.memberIds.filter((id) => id !== memberId) };
    this.emit();
    return null;
  }

  leave(): PartyError | null {
    if (!this.party) return 'no-party';
    if (this.locked) return 'queue-locked';
    this.party = null;
    this.pending.clear();
    this.emit();
    return null;
  }

  /** Returns ids of bots that joined on this tick so the caller can notify. */
  tick(now: number): string[] {
    if (!this.party || this.locked) return [];
    const joined: string[] = [];
    for (const [botId, at] of this.pending) {
      if (now < at) continue;
      this.pending.delete(botId);
      if (this.party.memberIds.length < PARTY_MAX) {
        this.party = { ...this.party, memberIds: [...this.party.memberIds, botId] };
        joined.push(botId);
      }
    }
    if (joined.length) this.emit();
    return joined;
  }

  botMembers(): string[] {
    return this.party ? this.party.memberIds.filter((id) => id !== SELF_ID && BOT_ROSTER.some((b) => b.id === id)) : [];
  }

  private guardMutation(): PartyError | null {
    if (!this.party) return 'no-party';
    if (!this.isLeader) return 'not-leader';
    if (this.locked) return 'queue-locked';
    return null;
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

export const PARTY_ERROR_TEXT: Record<PartyError, string> = {
  'not-leader': 'Chỉ trưởng nhóm mới làm được thao tác này.',
  full: 'Nhóm đã đủ người.',
  'already-member': 'Người này đã ở trong nhóm hoặc đã được mời.',
  'queue-locked': 'Nhóm đang tìm trận, không thể thay đổi thành viên.',
  'no-party': 'Bạn chưa có nhóm.',
};
