import { Icon } from '@/shared/ui'
import { useCommunity } from '../CommunityContext'
import { Empty } from './CommunityUI'
import styles from '../Community.module.css'

export default function NotificationsPanel() {
  const { notifications, connection, setPanel } = useCommunity()
  return <div className={styles.stack}>
    <p className={styles.hint}><Icon name={connection.social === 'connected' ? 'wifi' : 'wifi_off'} />{connection.social === 'connected' ? 'Đã kết nối thông báo trực tiếp.' : 'Đang kết nối lại thông báo.'}</p>
    <p className={styles.muted}>Thông báo nhận trong phiên này. Lịch sử lưu trên server chưa được hỗ trợ.</p>
    {!notifications.length ? <Empty icon="notifications_none">Chưa có thông báo mới trong phiên.</Empty> : <ul className={styles.list}>{notifications.map(row => <li key={row.eventId} className={styles.socialRow}><strong>{row.title}</strong><p className={styles.muted}>{row.body}</p><small className={styles.muted}>{new Date(row.occurredAt).toLocaleString('vi-VN')}</small>{['FRIEND_REQUEST', 'FRIEND_ACCEPTED'].includes(row.type) && <button className={styles.link} type="button" onClick={() => setPanel('friends')}>Mở Bạn bè</button>}</li>)}</ul>}
    <button className={styles.link} type="button" onClick={() => setPanel('friends')}>Xem bạn bè và lời mời đang chờ →</button>
  </div>
}
