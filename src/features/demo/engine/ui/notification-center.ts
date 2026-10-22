import { el, icon, replaceChildren } from './dom-helpers';

/** Same envelope as the social socket payload: {eventId,type,title,body,data,occurredAt}. */
export type GameNotification = {
  eventId: string;
  type: 'MATCH_FOUND' | 'MATCH_READY' | 'PARTY_JOINED' | 'DAILY_REWARD' | 'MATCH_RESULT' | 'INFO';
  title: string;
  body: string;
  occurredAt: number;
};

const TYPE_ICONS: Record<GameNotification['type'], string> = {
  MATCH_FOUND: 'sports_esports',
  MATCH_READY: 'table_restaurant',
  PARTY_JOINED: 'group_add',
  DAILY_REWARD: 'redeem',
  MATCH_RESULT: 'emoji_events',
  INFO: 'notifications',
};

/**
 * Session-only notifications: the badge counts items received since the
 * popover was last opened. Nothing is persisted and there is no "mark all
 * read" — matching what the backend actually supports.
 */
export class NotificationCenter {
  private readonly items: GameNotification[] = [];
  private readonly seen = new Set<string>();
  private unseen = 0;
  private open = false;
  readonly button: HTMLButtonElement;
  private readonly badge: HTMLSpanElement;
  private readonly popover: HTMLElement;
  private readonly list: HTMLElement;

  constructor(private readonly toastHost: HTMLElement) {
    this.badge = el('span', { class: 'badge', hidden: true }, '0');
    this.button = el('button', {
      class: 'icon-button bell',
      type: 'button',
      'aria-label': 'Thông báo',
      'aria-expanded': 'false',
      onclick: () => this.toggle(),
    }, icon('notifications'), this.badge);
    this.list = el('ul', { class: 'notif-list' });
    this.popover = el('section', { class: 'notif-popover', hidden: true, 'aria-label': 'Thông báo trong phiên' },
      el('header', { class: 'notif-head' }, el('h2', {}, 'Thông báo'), el('span', { class: 'muted small' }, 'Chỉ trong phiên này')),
      this.list,
    );
    document.addEventListener('pointerdown', (e) => {
      if (this.open && !this.popover.contains(e.target as Node) && !this.button.contains(e.target as Node)) this.toggle(false);
    });
    this.render();
  }

  get element(): HTMLElement {
    return this.popover;
  }

  push(notification: Omit<GameNotification, 'eventId' | 'occurredAt'> & { eventId?: string }, toast = true): void {
    const eventId = notification.eventId ?? `${notification.type}-${this.items.length}-${Math.round(performance.now())}`;
    if (this.seen.has(eventId)) return; // dedupe by eventId
    this.seen.add(eventId);
    const item: GameNotification = { ...notification, eventId, occurredAt: Date.now() };
    this.items.unshift(item);
    if (!this.open) this.unseen += 1;
    this.render();
    if (toast) this.toast(item.title, item.body, TYPE_ICONS[item.type]);
  }

  toast(title: string, body = '', iconName = 'info', tone: 'default' | 'error' | 'success' = 'default'): void {
    const node = el('div', { class: `toast toast-${tone}`, role: tone === 'error' ? 'alert' : 'status' },
      icon(iconName),
      el('div', {}, el('strong', {}, title), body ? el('p', {}, body) : null),
    );
    this.toastHost.appendChild(node);
    while (this.toastHost.children.length > 3) this.toastHost.firstElementChild?.remove();
    window.setTimeout(() => {
      node.classList.add('leaving');
      window.setTimeout(() => node.remove(), 260);
    }, 3600);
  }

  toggle(force?: boolean): void {
    this.open = force ?? !this.open;
    this.popover.hidden = !this.open;
    this.button.setAttribute('aria-expanded', String(this.open));
    if (this.open) this.unseen = 0;
    this.render();
  }

  private render(): void {
    this.badge.hidden = this.unseen === 0;
    this.badge.textContent = this.unseen > 9 ? '9+' : String(this.unseen);
    if (!this.items.length) {
      replaceChildren(this.list, el('li', { class: 'empty-state' }, icon('notifications_off'), el('p', {}, 'Chưa có thông báo nào trong phiên này.')));
      return;
    }
    const time = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });
    replaceChildren(
      this.list,
      ...this.items.slice(0, 30).map((n) =>
        el('li', { class: 'notif-item' },
          el('span', { class: 'notif-icon' }, icon(TYPE_ICONS[n.type])),
          el('div', {}, el('strong', {}, n.title), el('p', {}, n.body), el('time', { class: 'muted small' }, time.format(n.occurredAt))),
        ),
      ),
    );
  }
}
