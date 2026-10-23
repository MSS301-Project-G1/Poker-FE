import { el, formatChips, icon, replaceChildren } from './dom-helpers';

export type MatchResultSummary = {
  mode: 'RANK' | 'NORMAL';
  placement: number;
  playerCount: number;
  hands: number;
  biggestPot: number;
  rpDelta: number;
  coinDelta: number;
  aborted: boolean;
  winnerName: string | null;
};

export class MatchResultView {
  readonly root: HTMLElement;

  constructor(private readonly onAgain: () => void, private readonly onLobby: () => void) {
    this.root = el('section', { class: 'result-panel card', hidden: true, role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'result-title', 'data-testid': 'match-result' });
  }

  show(r: MatchResultSummary): void {
    const champion = r.placement === 1 && !r.aborted;
    const title = r.aborted ? 'Bạn đã rời bàn' : champion ? 'Vô địch bàn!' : `Hạng ${r.placement}/${r.playerCount}`;
    const reward = r.mode === 'RANK'
      ? el('div', { class: `reward ${r.rpDelta >= 0 ? 'up' : 'down'}` }, icon(r.rpDelta >= 0 ? 'trending_up' : 'trending_down'), `${r.rpDelta >= 0 ? '+' : ''}${r.rpDelta} RP`)
      : el('div', { class: `reward ${r.coinDelta > 0 ? 'up' : 'down'}` }, icon('paid'), r.coinDelta > 0 ? `+${formatChips(r.coinDelta)} xu` : `${formatChips(r.coinDelta)} xu (phí vào bàn)`);
    replaceChildren(
      this.root,
      el('span', { class: `result-medal ${champion ? 'gold' : ''}`, 'aria-hidden': 'true' }, icon(champion ? 'trophy' : r.aborted ? 'directions_walk' : 'military_tech')),
      el('h2', { id: 'result-title', class: 'result-title' }, title),
      el('p', { class: 'muted' }, r.aborted
        ? 'Rời bàn giữa trận được tính như bị loại ở vị trí hiện tại.'
        : champion ? 'Bạn là người cuối cùng còn chip.' : r.winnerName ? `${r.winnerName} đang dẫn bàn khi bạn bị loại.` : 'Bạn đã hết chip.'),
      reward,
      el('dl', { class: 'stat-row' },
        el('div', { class: 'stat' }, el('dt', {}, 'Số ván'), el('dd', {}, String(r.hands))),
        el('div', { class: 'stat' }, el('dt', {}, 'Pot lớn nhất'), el('dd', {}, formatChips(r.biggestPot))),
        el('div', { class: 'stat' }, el('dt', {}, 'Chế độ'), el('dd', {}, r.mode === 'RANK' ? 'Đấu hạng' : 'Thường')),
      ),
      el('footer', { class: 'queue-actions' },
        el('button', { class: 'btn btn-ghost', type: 'button', onclick: () => this.onLobby() }, 'Về sảnh'),
        el('button', { class: 'btn btn-primary', type: 'button', 'data-testid': 'play-again', onclick: () => this.onAgain() }, icon('replay'), 'Chơi tiếp'),
      ),
    );
    this.root.hidden = false;
    this.root.querySelector<HTMLElement>('.btn-primary')?.focus();
  }

  hide(): void {
    this.root.hidden = true;
  }
}
