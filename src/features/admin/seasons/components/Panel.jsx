import styles from './Panel.module.css'

// Raised violet card used by every admin season section.
export default function Panel({ as: Tag = 'section', className = '', children, ...props }) {
  return <Tag className={`${styles.panel} ${className}`} {...props}>{children}</Tag>
}
