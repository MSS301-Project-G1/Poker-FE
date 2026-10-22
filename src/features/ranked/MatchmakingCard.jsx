import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router'
import { Button, Icon } from '@/shared/ui'
import { paths } from '@/shared/config/paths'
import { useQueue } from './MatchmakingContext'
import styles from './MatchmakingCard.module.css'

const titles = { NONE: 'Sẵn sàng tìm trận', WAITING: 'Đang tìm người chơi', COUNTDOWN: 'Sắp bắt đầu', MATCHING: 'Đang ghép bàn', PROPOSED: 'Đã tìm thấy trận!', CREATING_TABLE: 'Đang tạo bàn', READY: 'Ván đấu đang diễn ra', FAILED: 'Không tìm được trận' }
const clock = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

export default function MatchmakingCard() {
  const state = useQueue()
  const location = useLocation()
  const [now, setNow] = useState(Date.now)
  const card = useRef(null)
  const trigger = useRef(null)
  const previousVisible = useRef(false)
  const { queue, mode, visible, pending, accepted, error, active, inMatch, open, minimize, close, start, cancel, accept, decline, returnToTable, leaveMatch } = state
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(timer) }, [])
  useEffect(() => {
    if (visible && !previousVisible.current) { trigger.current = document.activeElement; card.current?.focus() }
    if (!visible && previousVisible.current) trigger.current?.focus()
    previousVisible.current = visible
  }, [visible])
  const status = queue?.status
  const proposed = status === 'PROPOSED'
  const deadline = proposed ? queue?.acceptDeadline : queue?.matchStartDeadline
  const remaining = deadline ? Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000)) : null
  const elapsed = queue?.joinedAt ? Math.floor(Math.max(0, now - Date.parse(queue.joinedAt)) / 1000) : 0
  const max = Math.max(2, Math.min(10, queue?.maxPlayers || 6))
  if (!visible) return active && location.pathname !== paths.lobby ? createPortal(<button className={styles.mini} onClick={inMatch ? returnToTable : () => open(mode)} type="button"><span className={styles.pulse} />{mode === 'NORMAL' ? 'Chơi thường' : 'Đấu hạng'} · {inMatch ? 'Quay lại bàn' : 'Quay lại tìm trận'}</button>, document.body) : null
  return createPortal(<section ref={card} tabIndex={-1} className={styles.card} role="dialog" aria-modal="false" aria-labelledby="queue-title" data-testid="matchmaking-card" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); minimize() } }}>
    <header className={styles.header}><span className={styles.badge}>{mode === 'NORMAL' ? 'CHƠI THƯỜNG' : 'ĐẤU HẠNG'}</span><button type="button" className={styles.minimize} aria-label="Thu gọn tìm trận" onClick={minimize}><Icon name="close_fullscreen" /></button></header>
    <h2 id="queue-title">{queue ? titles[status] || status : 'Đang kiểm tra hàng chờ…'}</h2>
    {!inMatch && <p className={styles.elapsed}><Icon name="schedule" />Đã chờ <strong>{clock(elapsed)}</strong></p>}
    {inMatch && <p className={styles.hint}>{mode === 'NORMAL' ? 'Quay lại bàn để chơi tiếp, hoặc rời ván và chấp nhận xử thua.' : 'Trận đấu hạng vẫn đang diễn ra. Hãy quay lại bàn để chơi tiếp.'}</p>}
    {queue?.position != null && <p className={styles.hint}>Vị trí trong hàng: #{queue.position}</p>}
    {queue?.playerCount != null && <div className={styles.people} aria-label={`${queue.playerCount} người đang chờ`}><span aria-hidden="true" className={styles.dots}>{Array.from({ length: max }, (_, index) => <i key={index} className={index < queue.playerCount ? styles.filled : ''} />)}</span><strong>{queue.playerCount}/{queue.maxPlayers || max}</strong></div>}
    {status === 'WAITING' && queue?.minPlayers != null && <p className={styles.hint}>Cần tối thiểu {queue.minPlayers} người để mở bàn.</p>}
    {remaining != null && <p className={styles.countdown}>{proposed ? 'Xác nhận trong' : 'Bắt đầu sau'} <strong>{remaining}s</strong></p>}
    {proposed && <p className={styles.hint}>{accepted ? 'Đã xác nhận. Đang chờ những người chơi còn lại.' : 'Tất cả người chơi cần xác nhận trước khi hết giờ.'}</p>}
    {status === 'CREATING_TABLE' && <p className={styles.hint}>Đang chuẩn bị bàn poker. Bạn sẽ tự động được đưa vào trận.</p>}
    {status === 'NONE' && <p className={styles.hint}>Chọn tìm trận để bắt đầu ghép người chơi.</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.actions}>
      {(status === 'NONE' || status === 'FAILED') && <Button variant="primary" disabled={pending} onClick={() => start(mode)}>Tìm trận</Button>}
      {['WAITING', 'COUNTDOWN'].includes(status) && <Button disabled={pending} onClick={cancel}>Hủy tìm trận</Button>}
      {proposed && <><Button variant="primary" disabled={pending || accepted || remaining === 0} onClick={accept}>{accepted ? 'Đã xác nhận' : 'Chấp nhận trận'}</Button><Button disabled={pending || remaining === 0} onClick={decline}>Từ chối</Button></>}
      {inMatch && <><Button variant="primary" onClick={returnToTable}>Quay lại bàn</Button>{mode === 'NORMAL' && <Button disabled={pending} onClick={leaveMatch}>Rời ván</Button>}</>}
      {(!status || status === 'NONE' || status === 'FAILED') && <button className={styles.close} type="button" onClick={close}>Đóng</button>}
    </div>
  </section>, document.body)
}
