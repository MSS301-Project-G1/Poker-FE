import styles from './Button.module.css'
import { Icon } from '@/shared/ui'

/**
 * Isolated Shop Button Component
 * @param {object} props
 * @param {'primary'|'gold'|'secondary'|'danger'|'outlineGold'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.icon] Icon name from Material Symbols
 * @param {boolean} [props.loading]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const variantClass = styles[variant] || styles.primary
  const sizeClass = styles[size] || styles.md
  const isDisabled = disabled || loading

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`${styles.shopBtn} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <Icon name={icon} className="text-lg leading-none" />
      ) : null}
      <span>{children}</span>
    </button>
  )
}
