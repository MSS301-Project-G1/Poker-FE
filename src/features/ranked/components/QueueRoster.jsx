import { useEffect } from 'react'
import { useCommunity } from '@/features/community'
import { Icon } from '@/shared/ui'
import styles from '../RankedPage.module.css'

export default function QueueRoster({ queue, user, max, count }) {
  const { profiles, loadProfiles } = useCommunity()
  const ids = Array.isArray(queue?.playerIds) ? [...new Set(queue.playerIds)].slice(0, max) : []
  const idsKey = ids.join(',')
  useEffect(() => {
    if (idsKey) void loadProfiles(idsKey.split(','))
  }, [idsKey, loadProfiles])

  return <div className={styles.seats} style={{ '--seats': max }}>
    {Array.from({ length: max }, (_, index) => {
      const id = ids[index]
      const occupied = Boolean(id) || index < count
      const you = id === user?.accountId
      const profile = you ? user?.profile : profiles[id]
      const preparing = ['PARTY', 'PREPARING'].includes(queue?.status)
      const name = you ? `${profile?.displayName || 'Bạn'} (You)` : profile?.displayName || (id ? `Người chơi ${id.slice(0, 6)}` : occupied ? 'Đang tải người chơi…' : preparing ? 'Chỗ trống' : 'FINDING…')
      return <div className={`${styles.seat} ${occupied ? styles.filled : ''}`} key={id || `empty-${index}`} data-testid="queue-player" data-account-id={id || ''}>
        {occupied ? <img src={profile?.avatarUrl || '/stitch-assets/avatar.svg'} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/stitch-assets/avatar.svg' }} /> : <span className={styles.avatar}><Icon name="hourglass_top" /></span>}
        <strong title={name}>{name}</strong><span>{queue?.status === 'PARTY' ? id === queue.leaderId ? 'Trưởng nhóm' : occupied ? 'Thành viên' : 'Mời bạn bè vào nhóm' : queue?.status === 'PROPOSED' ? 'Trong đề xuất trận' : `Vị trí hiển thị #${String(index + 1).padStart(2, '0')}`}</span><small>{preparing ? occupied ? 'Sẵn sàng' : 'Đang chờ' : occupied ? 'IN QUEUE' : 'MATCHING'}</small>
      </div>
    })}
  </div>
}
