import { Icon } from '@/shared/ui'
import { useCommunity } from '../CommunityContext'
import styles from '../Community.module.css'

export function Avatar({ id, size = 'normal' }) {
  const { profiles, user } = useCommunity()
  const profile = id === user?.accountId ? user.profile : profiles[id]
  return <img className={`${styles.avatar} ${size === 'small' ? styles.avatarSmall : ''}`} alt="" src={profile?.avatarUrl || '/stitch-assets/avatar.svg'} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/stitch-assets/avatar.svg' }} />
}
export function Name({ id }) {
  const { profiles, user } = useCommunity()
  return <>{id === user?.accountId ? user.profile?.displayName || user.email || 'Bạn' : profiles[id]?.displayName || id?.slice(0, 8) || 'Người chơi'}</>
}
export function Empty({ icon = 'group', children }) {
  return <div className={styles.empty}><Icon name={icon} /><p>{children}</p></div>
}
export function ErrorNotice({ message, retry }) {
  return message ? <div className={styles.error} role="alert"><span>{message}</span>{retry && <button className={styles.link} type="button" onClick={retry}>Thử lại</button>}</div> : null
}
