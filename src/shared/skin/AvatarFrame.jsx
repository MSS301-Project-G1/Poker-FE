import styles from './skin.module.css'

/** @param {{ avatarUrl?: string, name: string, size?: 'md' | 'lg' }} props */
export default function AvatarFrame({ avatarUrl, name, size = 'md' }) {
  return <div className={`${styles.avatar} ${size === 'lg' ? styles.avatarLg : ''}`}>{avatarUrl ? <img src={avatarUrl} alt={name} /> : <span>{name.slice(0, 1).toUpperCase()}</span>}</div>
}
