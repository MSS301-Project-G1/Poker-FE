type Attrs = Record<string, string | number | boolean | undefined | null | EventListener>;
type Child = Node | string | null | undefined | false;

/**
 * Tiny element builder. Strings become text nodes, so player/bot content is
 * never parsed as HTML.
 */
export function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else if (key === 'class') {
      node.className = String(value);
    } else if (value === true) {
      node.setAttribute(key, '');
    } else {
      node.setAttribute(key, String(value));
    }
  }
  append(node, ...children);
  return node;
}

export function append(parent: Node, ...children: Child[]): void {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    parent.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
}

/** Material Symbols Outlined glyph. Decorative unless a label is passed. */
export function icon(name: string, label?: string): HTMLSpanElement {
  const span = el('span', { class: 'icon', 'aria-hidden': label ? undefined : 'true', 'aria-label': label, role: label ? 'img' : undefined }, name);
  return span;
}

export function replaceChildren(parent: Element, ...children: Child[]): void {
  parent.replaceChildren();
  append(parent, ...children);
}

const chipFormatter = new Intl.NumberFormat('vi-VN');

export function formatChips(value: number): string {
  return chipFormatter.format(Math.round(value));
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function rankTier(rp: number): { name: string; next: number } {
  const tiers: [number, string][] = [
    [0, 'Đồng'],
    [1100, 'Bạc'],
    [1250, 'Vàng'],
    [1400, 'Bạch kim'],
    [1600, 'Kim cương'],
    [1850, 'Huyền thoại'],
  ];
  let current = tiers[0];
  let next = Infinity;
  for (let i = 0; i < tiers.length; i += 1) {
    if (rp >= tiers[i][0]) {
      current = tiers[i];
      next = tiers[i + 1]?.[0] ?? Infinity;
    }
  }
  return { name: current[1], next };
}
