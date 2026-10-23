import { el, icon, initials, replaceChildren } from './dom-helpers';

export type ChatMessage = {
  id: string;
  clientMessageId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: number;
  status: 'pending' | 'sent' | 'failed';
  system?: boolean;
};

const MAX_LENGTH = 2000;

/**
 * Match chat panel: collapsible on desktop, drawer on mobile. Plain text only,
 * Enter sends, Shift+Enter breaks the line, never sends mid-IME composition.
 * Messages are merged by clientMessageId so a retry never duplicates.
 */
export class ChatPanel {
  readonly root: HTMLElement;
  private readonly log: HTMLElement;
  private readonly input: HTMLTextAreaElement;
  private readonly sendButton: HTMLButtonElement;
  private readonly newBadge: HTMLButtonElement;
  private readonly counter: HTMLElement;
  private readonly titleEl: HTMLElement;
  private messages: ChatMessage[] = [];
  private readOnly = false;
  private composing = false;
  private collapsed = true;
  private unread = 0;
  onSend: (content: string, clientMessageId: string) => void = () => undefined;
  onToggle: (open: boolean) => void = () => undefined;

  constructor(private readonly selfId: string) {
    this.log = el('ol', { class: 'chat-log', 'aria-live': 'polite', 'aria-relevant': 'additions' });
    this.log.addEventListener('scroll', () => {
      if (this.nearBottom()) this.setNewBadge(false);
    });
    this.input = el('textarea', {
      class: 'chat-input',
      rows: 1,
      maxlength: MAX_LENGTH,
      placeholder: 'Nhắn cho cả bàn…',
      'aria-label': 'Nội dung tin nhắn',
    });
    this.input.addEventListener('compositionstart', () => (this.composing = true));
    this.input.addEventListener('compositionend', () => (this.composing = false));
    this.input.addEventListener('input', () => this.syncComposer());
    this.input.addEventListener('keydown', (event) => {
      event.stopPropagation(); // keep table hotkeys out of typing
      if (event.key === 'Enter' && !event.shiftKey && !this.composing && !event.isComposing) {
        event.preventDefault();
        this.submit();
      }
    });
    this.sendButton = el('button', { class: 'icon-button send', type: 'button', 'aria-label': 'Gửi', onclick: () => this.submit() }, icon('send'));
    this.counter = el('span', { class: 'chat-counter muted small' });
    this.newBadge = el('button', { class: 'chat-new', type: 'button', hidden: true, onclick: () => this.scrollToEnd() }, 'Có tin mới');
    this.titleEl = el('h2', { class: 'chat-title' }, 'Chat trận');

    this.root = el('aside', { class: 'chat-panel collapsed', 'aria-label': 'Chat trận' },
      el('header', { class: 'chat-head' },
        icon('forum'),
        this.titleEl,
        el('span', { class: 'chat-status muted small' }, 'Trong bàn'),
        el('button', { class: 'icon-button', type: 'button', 'aria-label': 'Thu gọn chat', onclick: () => this.setOpen(false) }, icon('close')),
      ),
      el('div', { class: 'chat-body' }, this.log, this.newBadge),
      el('footer', { class: 'chat-composer' }, this.input, this.counter, this.sendButton),
    );
    this.syncComposer();
  }

  get isOpen(): boolean {
    return !this.collapsed;
  }

  get unreadCount(): number {
    return this.unread;
  }

  setOpen(open: boolean): void {
    this.collapsed = !open;
    this.root.classList.toggle('collapsed', this.collapsed);
    if (open) {
      this.unread = 0;
      this.scrollToEnd();
    }
    this.onToggle(open);
  }

  reset(title: string): void {
    this.messages = [];
    this.readOnly = false;
    this.unread = 0;
    this.titleEl.textContent = title;
    this.input.value = '';
    this.render();
    this.syncComposer();
  }

  /** Match ended: keep history, lock the composer. */
  setReadOnly(reason: string): void {
    this.readOnly = true;
    this.input.placeholder = reason;
    this.syncComposer();
  }

  upsert(message: ChatMessage): void {
    const index = this.messages.findIndex((m) => m.clientMessageId === message.clientMessageId || m.id === message.id);
    const stick = this.nearBottom();
    if (index >= 0) this.messages[index] = { ...this.messages[index], ...message };
    else {
      this.messages.push(message);
      if (this.collapsed && message.senderId !== this.selfId) this.unread += 1;
    }
    this.render();
    if (stick || message.senderId === this.selfId) this.scrollToEnd();
    else this.setNewBadge(true);
    this.onToggle(this.isOpen);
  }

  system(content: string): void {
    const id = `sys-${this.messages.length}-${Math.round(performance.now())}`;
    this.upsert({ id, clientMessageId: id, senderId: 'system', senderName: '', content, createdAt: Date.now(), status: 'sent', system: true });
  }

  private submit(): void {
    if (this.readOnly) return;
    const content = this.input.value;
    if (!content.trim()) return;
    const clientMessageId = crypto.randomUUID?.() ?? `local-${Date.now()}-${Math.random()}`;
    this.input.value = '';
    this.syncComposer();
    this.onSend(content.slice(0, MAX_LENGTH), clientMessageId);
  }

  private syncComposer(): void {
    const length = this.input.value.length;
    this.counter.textContent = length > MAX_LENGTH * 0.8 ? `${length}/${MAX_LENGTH}` : '';
    this.input.disabled = this.readOnly;
    this.sendButton.disabled = this.readOnly || !this.input.value.trim();
    this.input.style.height = 'auto';
    this.input.style.height = `${Math.min(120, this.input.scrollHeight)}px`;
  }

  private render(): void {
    const time = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (!this.messages.length) {
      replaceChildren(this.log, el('li', { class: 'empty-state' }, icon('chat_bubble'), el('p', {}, 'Chưa có tin nhắn. Chào cả bàn một câu nhé.')));
      return;
    }
    replaceChildren(
      this.log,
      ...this.messages.map((m) => {
        if (m.system) return el('li', { class: 'chat-system' }, m.content);
        const mine = m.senderId === this.selfId;
        return el('li', { class: `chat-msg ${mine ? 'mine' : ''}` },
          mine ? null : el('span', { class: 'chat-avatar', 'aria-hidden': 'true' }, initials(m.senderName)),
          el('div', { class: 'chat-bubble' },
            mine ? null : el('span', { class: 'chat-sender' }, m.senderName, el('span', { class: 'tag-bot' }, 'Bot')),
            el('p', { class: 'chat-text' }, m.content),
            el('span', { class: 'chat-meta muted small' },
              time.format(m.createdAt),
              m.status === 'pending' ? ' · đang gửi' : '',
              m.status === 'failed' ? ' · gửi lỗi' : '',
            ),
          ),
        );
      }),
    );
  }

  private nearBottom(): boolean {
    return this.log.scrollHeight - this.log.scrollTop - this.log.clientHeight < 48;
  }

  private scrollToEnd(): void {
    this.log.scrollTop = this.log.scrollHeight;
    this.setNewBadge(false);
  }

  private setNewBadge(show: boolean): void {
    this.newBadge.hidden = !show;
  }
}
