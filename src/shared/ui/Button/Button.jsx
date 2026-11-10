import { Icon } from '../Icon'
import styles from './Button.module.css'

/**
 * Standard app button. Pages built from Stitch markup may still use Tailwind buttons;
 * new feature code should prefer this component.
 * gold is the coin/purchase action; loading disables the button and swaps the icon for a spinner.
 * @param {{ variant?: 'primary' | 'secondary' | 'gold' | 'danger', size?: 'sm' | 'md', icon?: string,
 *   loading?: boolean, type?: 'button' | 'submit' }} props
 */
export default function Button({
  variant = 'secondary', size = 'md', icon, loading = false, disabled, type = 'button', className = '', children, ...props
}) {
  return <button type={type} disabled={disabled || loading} aria-busy={loading || undefined}
    className={`${styles.button} ${styles[variant] || ''} ${size === 'sm' ? styles.sm : ''} ${className}`} {...props}>
    {loading ? <span className={styles.spinner} aria-hidden="true" /> : icon && <Icon name={icon} className={styles.icon} />}
    {children}
  </button>
}
