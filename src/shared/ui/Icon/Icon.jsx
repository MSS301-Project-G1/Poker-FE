/**
 * Material Symbols icon. Decorative by default (hidden from screen readers);
 * give the parent button a title or aria-label when the icon is its only content.
 * @param {{ name: string, filled?: boolean, className?: string }} props
 */
export default function Icon({ name, filled = false, className = '' }) {
  return <span className={`material-symbols-outlined ${filled ? 'icon-filled' : ''} ${className}`} aria-hidden="true">{name}</span>
}
