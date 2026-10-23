import type { QueueStatusResponse } from '../meta/matchmaking-sim';
import { el, formatClock, icon, replaceChildren } from './dom-helpers';

export type QueueActions = {
  leave(): void;
  accept(): void;
  decline(): void;
  minimize(): void;
  reload(): void;
  backToLobby(): void;
};

const STATUS_TITLE: Record<QueueStatusResponse['status'], string> = {
  NONE: '',
  WAITING: 'Đang tìm người chơi',
  COUNTDOWN: 'Sắp bắt đầu',
  MATCHING: 'Đang ghép bàn',
  PROPOSED: 'Đã tìm thấy trận!',
  CREATING_TABLE: 'Đang tạo bàn',
  READY: 'Bàn đã sẵn sàng',
  FAILED: 'Không tìm được trận',
};

/**
 * Matchmaking panel driven only by QueueStatusResponse. Structure is rebuilt
 * when the status changes; clocks update every frame via tick().
 */
export class QueueView {
  readonly root: HTMLElement;
  private lastKey = '';
  private elapsedEl: HTMLElement | null = null;
  private countdownEl: HTMLElement | null = null;
  private acceptBar: HTMLElement | null = null;
  private snapshot: QueueStatusResponse | null = null;

  constructor(private readonly actions: QueueActions) {
    this.root = el('section', { class: 'queue-panel card', hidden: true, role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'queue-title', 'data-testid': 'queue-panel' });
    this.root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        this.actions.minimize();
      }
    });
  }

  get visible(): boolean {
    return !this.root.hidden;
  }

  setVisible(visible: boolean): void {
    const wasHidden = this.root.hidden;
    this.root.hidden = !visible;
    if (visible && wasHidden) this.root.querySelector<HTMLElement>('.btn-primary, .btn')?.focus();
  }

  render(s: QueueStatusResponse, now: number): void {
    this.snapshot = s;
    const key = `${s.status}:${s.accepted}:${s.playerCount}:${s.position}`;
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.build(s);
    }
    this.tick(now);
  }

  tick(now: number): void {
    const s = this.snapshot;
    if (!s) return;
    if (this.elapsedEl && s.joinedAt !== null) this.elapsedEl.textContent = formatClock(now - s.joinedAt);
    if (this.countdownEl) {
      const deadline = s.status === 'PROPOSED' ? s.acceptDeadline : s.matchStartDeadline;
      this.countdownEl.textContent = deadline !== null ? `${Math.max(0, Math.ceil((deadline - now) / 1000))}s` : '';
    }
    if (this.acceptBar && s.acceptDeadline !== null) {
      const left = Math.max(0, Math.min(1, (s.acceptDeadline - now) / 10000));
      this.acceptBar.style.setProperty('--progress', left.toFixed(3));
    }
  }

  private build(s: QueueStatusResponse): void {
    const focusedInside = this.root.contains(document.activeElement);
    this.elapsedEl = null;
    this.countdownEl = null;
    this.acceptBar = null;
    const modeLabel = s.mode === 'RANK' ? 'Đấu hạng' : 'Chơi thường';
    const head = el('header', { class: 'queue-head' },
      el('span', { class: `mode-tag`, 'data-mode': modeLabel }, modeLabel),
      el('button', { class: 'icon-button', type: 'button', 'aria-label': 'Thu nhỏ, về sảnh', onclick: () => this.actions.minimize() }, icon('close_fullscreen')),
    );
    const title = el('h2', { id: 'queue-title', class: 'queue-title' }, STATUS_TITLE[s.status]);
    const body: (HTMLElement | null)[] = [];

    if (s.status === 'WAITING' || s.status === 'COUNTDOWN') {
      this.elapsedEl = el('span', { class: 'queue-clock' }, '00:00');
      body.push(
        el('p', { class: 'queue-sub' }, icon('schedule'), 'Đã chờ ', this.elapsedEl),
        s.position !== null ? el('p', { class: 'muted small' }, `Vị trí trong hàng: #${s.position}`) : null,
        seatDots(s),
      );
      if (s.status === 'COUNTDOWN') {
        this.countdownEl = el('strong', { class: 'queue-countdown' });
        body.push(el('p', { class: 'queue-sub' }, 'Bàn bắt đầu sau ', this.countdownEl, ' — hoặc ngay khi đủ 6 người'));
      } else {
        body.push(el('p', { class: 'muted small' }, `Cần tối thiểu ${s.minPlayers} người để mở bàn.`));
      }
    } else if (s.status === 'MATCHING' || s.status === 'CREATING_TABLE' || s.status === 'READY') {
      body.push(el('div', { class: 'spinner', role: 'progressbar', 'aria-label': STATUS_TITLE[s.status] }), seatDots(s));
      body.push(el('p', { class: 'muted small' }, s.status === 'MATCHING' ? 'Trận đã khóa người chơi, không thể hủy nữa.' : 'Đang chuẩn bị bàn và chia chỗ ngồi…'));
    } else if (s.status === 'PROPOSED') {
      this.countdownEl = el('strong', { class: 'queue-countdown' });
      this.acceptBar = el('div', { class: 'accept-bar', role: 'presentation' }, el('span'));
      body.push(
        el('p', { class: 'queue-sub' }, `Trận Rank ${s.playerCount ?? s.minPlayers} người. Xác nhận trong `, this.countdownEl),
        this.acceptBar,
      );
      if (s.accepted) body.push(el('p', { class: 'accepted-note' }, icon('check_circle'), 'Đã chấp nhận, đang chờ người khác…'));
    } else if (s.status === 'FAILED') {
      body.push(el('p', { class: 'error-text', role: 'alert' }, icon('error'), s.failReason ?? 'Có lỗi khi tìm trận.'));
    }

    const actions: HTMLElement[] = [];
    if (s.status === 'WAITING' || s.status === 'COUNTDOWN') {
      actions.push(el('button', { class: 'btn btn-secondary', type: 'button', 'data-testid': 'queue-cancel', onclick: () => this.actions.leave() }, 'Hủy tìm trận'));
    } else if (s.status === 'PROPOSED' && !s.accepted) {
      actions.push(
        el('button', { class: 'btn btn-ghost', type: 'button', onclick: () => this.actions.decline() }, 'Từ chối'),
        el('button', { class: 'btn btn-primary', type: 'button', 'data-testid': 'queue-accept', onclick: () => this.actions.accept() }, icon('check'), 'Chấp nhận'),
      );
    } else if (s.status === 'FAILED') {
      actions.push(
        el('button', { class: 'btn btn-ghost', type: 'button', onclick: () => this.actions.backToLobby() }, 'Về sảnh'),
        el('button', { class: 'btn btn-primary', type: 'button', onclick: () => this.actions.reload() }, icon('refresh'), 'Tải lại trạng thái'),
      );
    }

    replaceChildren(this.root, head, title, ...body, actions.length ? el('footer', { class: 'queue-actions' }, ...actions) : null);
    this.root.dataset.status = s.status;
    if (focusedInside || s.status === 'PROPOSED') this.root.querySelector<HTMLElement>('.btn-primary, .btn, .icon-button')?.focus();
  }
}

function seatDots(s: QueueStatusResponse): HTMLElement {
  const count = s.playerCount ?? 0;
  return el('div', { class: 'seat-dots', role: 'img', 'aria-label': `${count}/${s.maxPlayers} người` },
    ...Array.from({ length: s.maxPlayers }, (_, i) =>
      el('span', { class: `dot ${i < count ? 'filled' : ''} ${i === s.minPlayers - 1 ? 'min' : ''}` }),
    ),
    el('span', { class: 'dots-label' }, `${count}/${s.maxPlayers}`),
  );
}
