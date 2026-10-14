import styles from './skin.module.css'

export default function TableTheme({ className = '', children }) {
  return <div className={`${styles.felt} ${className}`}>{children}</div>
}
