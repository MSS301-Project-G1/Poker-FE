import { BOT_ROSTER } from '../meta/bot-roster';
import type { Party } from '../meta/party-store';
import { PARTY_MAX, SELF_ID } from '../meta/party-store';
import { CHECK_IN_REWARD, type PlayerProfile } from '../meta/profile-store';
import { el, formatChips, icon, initials, rankTier, replaceChildren } from './dom-helpers';

export const NORMAL_ENTRY_FEE = 200;

export type LeaderRow = { id: string; name: string; rp: number; isSelf: boolean };

export type LobbyState = {
  profile: PlayerProfile;
  party: Party | null;
  isLeader: boolean;
  partyLocked: boolean;
  isPending: (botId: string) => boolean;
  queueActive: boolean;
  queueLabel: string;
  canCheckIn: boolean;
  leaderboard: LeaderRow[];
};

export type LobbyActions = {
  checkIn(): void;
  playRank(): void;
  playNormal(): void;
  resumeQueue(): void;
  createParty(): void;
  copyCode(code: string): void;
  invite(botId: string): void;
  kick(memberId: string): void;
  leaveParty(): void;
};

/**
 * Lobby: player summary + daily check-in, Rank / Normal entry, party panel and
 * the local leaderboard. Re-rendered from state; focus is restored by data-key
 * so keyboard users don't lose their place when the panel refreshes.
 */
export class LobbyView {
  readonly root: HTMLElement;
  private readonly summary: HTMLElement;
  private readonly modes: HTMLElement;
  private readonly party: HTMLElement;
  private readonly board: HTMLElement;

  constructor(private readonly actions: LobbyActions) {
    this.summary = el('section', { class: 'card player-summary', 'aria-label': 'Thông tin người chơi' });
    this.modes = el('section', { class: 'mode-grid', 'aria-label': 'Chế độ chơi' });
    this.party = el('section', { class: 'card party-panel', 'aria-labelledby': 'party-title' });
    this.board = el('section', { class: 'card leaderboard', 'aria-labelledby': 'board-title' });
    this.root = el('main', { class: 'lobby', id: 'lobby' },
      el('div', { class: 'lobby-main' }, this.summary, this.modes),
      el('div', { class: 'lobby-side' }, this.party, this.board),
    );
  }

  setVisible(visible: boolean): void {
    this.root.hidden = !visible;
  }

  render(state: LobbyState): void {
    const focusedKey = (document.activeElement as HTMLElement | null)?.dataset?.key;
    this.renderSummary(state);
    this.renderModes(state);
    this.renderParty(state);
    this.renderBoard(state);
    if (focusedKey) this.root.querySelector<HTMLElement>(`[data-key="${focusedKey}"]`)?.focus();
  }

  private renderSummary({ profile, canCheckIn }: LobbyState): void {
    const tier = rankTier(profile.rp);
    const progress = Number.isFinite(tier.next) ? Math.min(1, Math.max(0, 1 - (tier.next - profile.rp) / 150)) : 1;
    replaceChildren(
      this.summary,
      el('div', { class: 'summary-head' },
        el('span', { class: 'avatar-lg', 'aria-hidden': 'true' }, initials(profile.name)),
        el('div', { class: 'summary-id' },
          el('h1', { class: 'summary-name' }, profile.name),
          el('span', { class: 'tier-badge' }, icon('military_tech'), `${tier.name} · ${formatChips(profile.rp)} RP`),
        ),
      ),
      el('div', { class: 'tier-progress', role: 'progressbar', 'aria-label': 'Tiến độ hạng', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(progress * 100) },
        el('span', { style: `--progress:${progress.toFixed(3)}` }),
      ),
      el('p', { class: 'muted small' }, Number.isFinite(tier.next) ? `Còn ${formatChips(tier.next - profile.rp)} RP để lên hạng kế tiếp` : 'Hạng cao nhất'),
      el('dl', { class: 'stat-row' },
        stat('Xu', formatChips(profile.coins), 'paid'),
        stat('Trận', String(profile.matches), 'playing_cards'),
        stat('Thắng', String(profile.wins), 'emoji_events'),
      ),
      el('button', {
        class: 'btn btn-secondary checkin',
        type: 'button',
        'data-key': 'checkin',
        disabled: !canCheckIn,
        onclick: () => this.actions.checkIn(),
      }, icon(canCheckIn ? 'redeem' : 'check_circle'), canCheckIn ? `Điểm danh +${CHECK_IN_REWARD} xu` : 'Đã điểm danh hôm nay'),
    );
  }

  private renderModes(state: LobbyState): void {
    const inParty = state.party !== null;
    const partySize = state.party?.memberIds.length ?? 1;
    const poor = state.profile.coins < NORMAL_ENTRY_FEE;
    if (state.queueActive) {
      replaceChildren(
        this.modes,
        el('div', { class: 'card resume-card' },
          el('span', { class: 'pulse-dot', 'aria-hidden': 'true' }),
          el('div', {}, el('strong', {}, 'Bạn đang trong hàng chờ'), el('p', { class: 'muted small' }, state.queueLabel)),
          el('button', { class: 'btn btn-primary', type: 'button', 'data-key': 'resume', onclick: () => this.actions.resumeQueue() }, icon('travel_explore'), 'Quay lại tìm trận'),
        ),
      );
      return;
    }
    replaceChildren(
      this.modes,
      el('article', { class: 'card mode-card mode-rank' },
        el('span', { class: 'mode-icon', 'aria-hidden': 'true' }, icon('workspace_premium')),
        el('h2', {}, 'Đấu hạng'),
        el('p', { class: 'muted' }, 'Sit & Go 4–6 người, chơi đơn. Xếp hạng càng cao càng nhiều RP.'),
        el('ul', { class: 'mode-facts' }, el('li', {}, 'Phải xác nhận khi tìm thấy trận'), el('li', {}, 'Hạng 1: +30 RP')),
        el('button', {
          class: 'btn btn-primary',
          type: 'button',
          'data-key': 'rank',
          'data-testid': 'play-rank',
          disabled: inParty,
          onclick: () => this.actions.playRank(),
        }, icon('swords'), 'Tìm trận Rank'),
        inParty ? el('p', { class: 'hint' }, icon('info'), 'Rank chỉ chơi đơn — rời nhóm để vào hàng Rank.') : null,
      ),
      el('article', { class: 'card mode-card mode-normal' },
        el('span', { class: 'mode-icon', 'aria-hidden': 'true' }, icon('casino')),
        el('h2', {}, 'Chơi thường'),
        el('p', { class: 'muted' }, `Phí vào ${formatChips(NORMAL_ENTRY_FEE)} xu. Top 2 chia thưởng 65% / 35%.`),
        el('ul', { class: 'mode-facts' }, el('li', {}, inParty ? `Cả nhóm ${partySize} người cùng vào bàn` : 'Có thể rủ nhóm tối đa 6 người'), el('li', {}, 'Không mất RP')),
        el('button', {
          class: 'btn btn-primary',
          type: 'button',
          'data-key': 'normal',
          'data-testid': 'play-normal',
          disabled: poor || (inParty && !state.isLeader),
          onclick: () => this.actions.playNormal(),
        }, icon('play_arrow'), inParty ? 'Cả nhóm chơi nhanh' : 'Chơi nhanh'),
        poor ? el('p', { class: 'hint' }, icon('info'), 'Không đủ xu — điểm danh mỗi ngày để nhận thêm.') : null,
      ),
    );
  }

  private renderParty(state: LobbyState): void {
    const party = state.party;
    const head = el('header', { class: 'card-head' }, el('h2', { id: 'party-title' }, icon('groups'), 'Nhóm'), party ? el('span', { class: 'muted small' }, `${party.memberIds.length}/${PARTY_MAX}`) : null);
    if (!party) {
      replaceChildren(
        this.party,
        head,
        el('p', { class: 'muted' }, 'Tạo nhóm để rủ bạn bè vào cùng bàn Chơi thường.'),
        el('button', { class: 'btn btn-secondary', type: 'button', 'data-key': 'create-party', disabled: state.queueActive, onclick: () => this.actions.createParty() }, icon('group_add'), 'Tạo nhóm'),
      );
      return;
    }
    const locked = state.partyLocked;
    const canManage = state.isLeader && !locked;
    const members = party.memberIds.map((id) => {
      const bot = BOT_ROSTER.find((b) => b.id === id);
      const name = id === SELF_ID ? state.profile.name : (bot?.name ?? id);
      const leader = id === party.leaderId;
      return el('li', { class: 'member-row' },
        el('span', { class: 'avatar-sm', 'aria-hidden': 'true' }, initials(name)),
        el('span', { class: 'member-name' }, name, id === SELF_ID ? el('span', { class: 'muted small' }, ' (bạn)') : el('span', { class: 'tag-bot' }, 'Bot')),
        leader ? el('span', { class: 'leader-badge', title: 'Trưởng nhóm' }, icon('crown', 'Trưởng nhóm')) : null,
        canManage && id !== SELF_ID
          ? el('button', { class: 'icon-button small', type: 'button', 'data-key': `kick-${id}`, 'aria-label': `Mời ${name} rời nhóm`, onclick: () => this.actions.kick(id) }, icon('person_remove'))
          : null,
      );
    });
    const friends = BOT_ROSTER.filter((b) => !party.memberIds.includes(b.id)).map((bot) => {
      const pending = state.isPending(bot.id);
      return el('li', { class: 'friend-row' },
        el('span', { class: 'avatar-sm', 'aria-hidden': 'true' }, initials(bot.name)),
        el('span', { class: 'member-name' }, bot.name, el('span', { class: 'tag-bot' }, 'Bot')),
        el('button', {
          class: 'chip-button',
          type: 'button',
          'data-key': `invite-${bot.id}`,
          disabled: !canManage || pending || party.memberIds.length >= PARTY_MAX,
          onclick: () => this.actions.invite(bot.id),
        }, pending ? 'Đang chờ…' : 'Mời'),
      );
    });
    replaceChildren(
      this.party,
      head,
      el('div', { class: 'party-code' },
        el('span', { class: 'muted small' }, 'Mã nhóm'),
        el('code', { 'data-testid': 'party-code' }, party.partyCode),
        el('button', { class: 'icon-button small', type: 'button', 'data-key': 'copy-code', 'aria-label': 'Sao chép mã nhóm', onclick: () => this.actions.copyCode(party.partyCode) }, icon('content_copy')),
      ),
      locked ? el('p', { class: 'hint' }, icon('lock'), 'Nhóm đang tìm trận — tạm khóa thành viên.') : null,
      el('ul', { class: 'member-list' }, ...members),
      state.isLeader ? el('h3', { class: 'sub-head' }, 'Bạn bè') : null,
      state.isLeader ? el('ul', { class: 'friend-list' }, ...friends) : null,
      el('button', { class: 'btn btn-ghost', type: 'button', 'data-key': 'leave-party', disabled: locked, onclick: () => this.actions.leaveParty() }, icon('logout'), 'Rời nhóm'),
    );
  }

  private renderBoard({ leaderboard }: LobbyState): void {
    const rows = [...leaderboard].sort((a, b) => b.rp - a.rp);
    replaceChildren(
      this.board,
      el('header', { class: 'card-head' }, el('h2', { id: 'board-title' }, icon('leaderboard'), 'Bảng xếp hạng'), el('span', { class: 'muted small' }, 'Trên máy này')),
      el('ol', { class: 'board-list' },
        ...rows.map((row, i) =>
          el('li', { class: `board-row ${row.isSelf ? 'self' : ''} ${i < 3 ? 'top' : ''}` },
            el('span', { class: 'board-rank' }, String(i + 1)),
            el('span', { class: 'member-name' }, row.name, row.isSelf ? null : el('span', { class: 'tag-bot' }, 'Bot')),
            el('span', { class: 'board-rp' }, `${formatChips(row.rp)} RP`),
          ),
        ),
      ),
    );
  }
}

function stat(label: string, value: string, iconName: string): HTMLElement {
  return el('div', { class: 'stat' }, el('dt', {}, icon(iconName), label), el('dd', {}, value));
}
