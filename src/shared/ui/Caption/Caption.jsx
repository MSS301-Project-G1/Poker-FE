import styles from './Caption.module.css'

// Muted supporting line under a heading, or a small panel label: "Season 3 · 12 days left", "Your standing".
export default function Caption({ as: Tag = 'p', className = '', children, ...props }) {
  return <Tag className={`${styles.caption} ${className}`} {...props}>{children}</Tag>
}
