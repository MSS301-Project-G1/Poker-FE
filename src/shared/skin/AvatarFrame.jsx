import styles from './skin.module.css'

export default function AvatarFrame({ avatarUrl, name }) {
  return <div className={styles.avatar}>{avatarUrl ? <img src={avatarUrl} alt={name} /> : <span>{name.slice(0, 1).toUpperCase()}</span>}</div>
}
