import styles from './Eyebrow.module.css'

// Small gold overline above a title, e.g. "GAME ADMINISTRATION".
export default function Eyebrow({ as: Tag = 'span', className = '', children }) {
  return <Tag className={`${styles.eyebrow} ${className}`}>{children}</Tag>
}
