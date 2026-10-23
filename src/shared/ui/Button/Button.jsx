import styles from './Button.module.css'

/**
 * Standard app button. Pages built from Stitch markup may still use Tailwind buttons;
 * new feature code should prefer this component.
 * @param {{ variant?: 'primary' | 'secondary' | 'danger', type?: 'button' | 'submit' }} props
 */
export default function Button({ variant = 'secondary', type = 'button', className = '', ...props }) {
  return <button type={type} className={`${styles.button} ${styles[variant]} ${className}`} {...props} />
}
