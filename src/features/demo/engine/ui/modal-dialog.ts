import { el, icon } from './dom-helpers';

type ModalOptions = {
  title: string;
  body: Node;
  actions?: { label: string; variant?: 'primary' | 'secondary' | 'danger'; onClick: () => void | boolean }[];
};

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * One modal at a time (no stacked modals). Traps focus, closes on Escape and
 * returns focus to whatever opened it.
 */
export class ModalDialog {
  private current: { root: HTMLElement; restore: Element | null } | null = null;

  constructor(private readonly host: HTMLElement) {}

  get isOpen(): boolean {
    return this.current !== null;
  }

  open(options: ModalOptions): void {
    this.close();
    const titleId = `modal-title-${Date.now()}`;
    const close = () => this.close();
    const panel = el(
      'div',
      { class: 'modal-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
      el('header', { class: 'modal-head' },
        el('h2', { id: titleId, class: 'modal-title' }, options.title),
        el('button', { class: 'icon-button', type: 'button', 'aria-label': 'Đóng', onclick: close }, icon('close')),
      ),
      el('div', { class: 'modal-body' }, options.body),
      options.actions?.length
        ? el('footer', { class: 'modal-actions' },
            ...options.actions.map((a) =>
              el('button', {
                class: `btn btn-${a.variant ?? 'secondary'}`,
                type: 'button',
                onclick: () => {
                  if (a.onClick() !== false) close();
                },
              }, a.label),
            ),
          )
        : null,
    );
    const root = el('div', { class: 'modal-scrim', onclick: (e: Event) => e.target === root && close() }, panel);
    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      } else if (event.key === 'Tab') {
        const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => !n.hasAttribute('disabled'));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    this.current = { root, restore: document.activeElement };
    this.host.appendChild(root);
    const target = panel.querySelector<HTMLElement>('[data-autofocus]') ?? panel.querySelector<HTMLElement>('.modal-actions .btn-primary') ?? panel.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();
  }

  close(): void {
    if (!this.current) return;
    const { root, restore } = this.current;
    this.current = null;
    root.remove();
    if (restore instanceof HTMLElement) restore.focus();
  }
}
