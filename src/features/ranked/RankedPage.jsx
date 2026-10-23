import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '@/features/auth'
import { Button, Icon } from '@/shared/ui'
import { paths } from '@/shared/config/paths'
import { useQueue } from './MatchmakingContext'
import MatchRadar from './components/MatchRadar'
import QueueRoster from './components/QueueRoster'
import styles from './RankedPage.module.css'

const titles = { NONE: 'Sẵn sàng tìm trận', WAITING: 'Đang tìm người chơi', COUNTDOWN: 'Sắp bắt đầu', MATCHING: 'Đang ghép bàn', PROPOSED: 'Đã tìm thấy trận!', CREATING_TABLE: 'Đang tạo bàn', READY: 'Ván đấu đang diễn ra', FAILED: 'Không tìm được trận' }
const clock = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

export default function RankedPage() {
  const [params] = useSearchParams()
  const state = useQueue()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [now, setNow] = useState(Date.now)
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(timer) }, [])
  const mode = state.activeMode || (params.get('mode') === 'NORMAL' ? 'NORMAL' : 'RANK')
  const current = mode === 'NORMAL' ? state.normal : state.rank
  const queue = current.queue
  const status = queue?.status
  const idle = status === 'NONE' || status === 'FAILED'
  const proposed = status === 'PROPOSED'
  const deadline = proposed ? queue?.acceptDeadline : queue?.matchStartDeadline
  const remaining = deadline ? Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000)) : null
  const elapsed = queue?.joinedAt ? Math.floor(Math.max(0, now - Date.parse(queue.joinedAt)) / 1000) : 0
  const max = Math.max(2, Math.min(10, queue?.maxPlayers || 6))
  const count = Math.max(0, queue?.playerCount ?? queue?.playerIds?.length ?? 0)
  const inMatch = status === 'READY' && Boolean(queue?.tableId)
  async function cancel() {
    if (await current.leave()) { state.close(); navigate(paths.lobby) }
  }
  return <div className={styles.page}>
    <section className={styles.panel} aria-label="Ranked matchmaking">
      <header className={styles.header}>
        <div className={styles.heading}><span className={styles.emblem}><Icon name="military_tech" /></span><div><p className={styles.eyebrow}>{mode === 'RANK' ? 'RANKED' : 'NORMAL'} · {max}-MAX NO-LIMIT HOLD’EM</p><h1>{mode === 'RANK' ? 'Ranked Match' : 'Normal Match'}</h1></div></div>
        <div className={styles.mode}>{mode === 'RANK' ? 'ĐẤU HẠNG · SOLO' : 'CHƠI THƯỜNG'}</div>
      </header>
      <div className={styles.main}>
        <MatchRadar elapsed={clock(elapsed)} title={idle ? 'READY TO SEARCH' : 'SEARCHING TABLE'} active={!idle && Boolean(queue)} detail={queue?.position != null ? `Vị trí trong hàng: #${queue.position}` : 'Trạng thái được cập nhật từ máy chủ'} />
        <aside className={styles.side}>
          <div className={styles.performance}><div className={styles.sectionTitle}><Icon name="hotel_class" /><h2>THÔNG TIN GHÉP TRẬN</h2></div>
            <div className={styles.stats}><div><span>Người đang chờ</span><strong>{count} / {max}</strong><i /></div><div><span>Tối thiểu mở bàn</span><strong>{queue?.minPlayers ?? '—'}</strong><i /></div></div>
            <div className={styles.player}><Icon name="person" /><div><strong>{user?.profile?.displayName || user?.email || 'Bạn'}</strong><p>{mode === 'RANK' ? 'Ghép theo Elo · Cần xác nhận trận' : 'Chơi một mình hoặc cùng nhóm'}</p></div></div>
          </div>
          <div className={styles.notice}><Icon name="info" /><div><h2>{queue ? titles[status] || status : 'Đang kiểm tra hàng chờ…'}</h2>
            {remaining != null && <p>{proposed ? 'Xác nhận trong' : 'Bắt đầu sau'} <strong>{remaining}s</strong></p>}
            {proposed && <p>{current.accepted ? 'Đã xác nhận. Đang chờ người chơi còn lại.' : 'Xác nhận trước khi hết thời gian.'}</p>}
            {status === 'WAITING' && <p>Đang chờ đủ người chơi để ghép bàn.</p>}
            {status === 'CREATING_TABLE' && <p>Bạn sẽ tự động vào bàn khi máy chủ chuẩn bị xong.</p>}
          </div></div>
        </aside>
      </div>
      <div className={styles.gathering}>
        <div className={styles.progress}><strong>TABLE GATHERING PROGRESS <b>{count}/{max}</b></strong><span>{idle ? 'Sẵn sàng tham gia hàng chờ' : 'Đang cập nhật tiến trình ghép trận…'}</span></div>
        <QueueRoster queue={queue} user={user} max={max} count={count} />
      </div>
      {current.error && <p className={styles.error} role="alert">{current.error}</p>}
      <footer className={styles.footer}><span><Icon name="lock" /> Xác nhận và tạo bàn do máy chủ xử lý</span><div className={styles.actions}>
        {idle && <><Button onClick={() => navigate(paths.lobby)}>Về lobby</Button><Button variant="primary" disabled={state.pending} onClick={() => state.start(mode)}>Tìm trận</Button></>}
        {['WAITING', 'COUNTDOWN'].includes(status) && <Button disabled={state.pending} onClick={cancel}>Hủy tìm trận</Button>}
        {proposed && <><Button disabled={state.pending || remaining === 0} onClick={state.decline}>Từ chối</Button><Button variant="primary" disabled={state.pending || current.accepted || remaining === 0} onClick={state.accept}>{current.accepted ? 'Đã xác nhận' : 'Chấp nhận trận'}</Button></>}
        {inMatch && <Button variant="primary" onClick={() => navigate(paths.tableById(queue.tableId))}>Quay lại bàn</Button>}
      </div></footer>
    </section>
  </div>
}
