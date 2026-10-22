import { useEffect, useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { gatewayRequest } from '@/shared/api/gatewayClient'
import { useAuth } from '@/features/auth'
import { useQueue } from '@/features/ranked'
import styles from './LoungeModes.module.css'

export default function LoungeModes() {
  const { active, activeMode, queue, start, open, pending } = useQueue()
  const { user } = useAuth()
  const [state, setState] = useState({ loading: true, party: null, error: '' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    let timer
    async function refresh() {
      try {
        const party = await gatewayRequest('/api/party/me', { signal: controller.signal })
        if (!controller.signal.aborted) setState({ loading: false, party: party?.partyId ? party : null, error: '' })
      } catch (error) {
        if (!controller.signal.aborted) setState(previous => ({ ...previous, loading: false, error: error.message }))
      } finally { if (!controller.signal.aborted) timer = setTimeout(refresh, 5000) }
    }
    void refresh()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [attempt])
  return <section aria-label="Chế độ chơi" className={styles.section}>
    {state.error && <p className={styles.error} role="alert">{state.error} <button type="button" onClick={() => setAttempt(value => value + 1)}>Thử lại</button></p>}
    {active ? <div className={styles.resume}><span className={styles.pulse} /><div><h2>Bạn đang trong hàng chờ</h2><p>{activeMode === 'NORMAL' ? 'Chơi thường' : 'Đấu hạng'} · {queue?.playerCount != null ? `${queue.playerCount}/${queue.maxPlayers || 6} người` : 'Đang ghép bàn'}</p></div><Button variant="primary" onClick={() => open(activeMode)}>Quay lại tìm trận</Button></div> : <div className={styles.grid}>
      <article className={`${styles.card} ${styles.rank}`}><header className={styles.cardHead}><span className={styles.modeIcon}><Icon name="workspace_premium" /></span><div className={styles.cardTitle}><span className={styles.eyebrow}>RANKED POKER</span><h2>Đấu hạng</h2></div></header><p>Thử sức ở bàn đấu xếp hạng. Mỗi quyết định đều tạo nên khác biệt.</p><ul><li>Ghép trận theo xếp hạng</li><li>Xác nhận khi tìm thấy trận</li><li>Chế độ chơi đơn</li></ul><Button variant="primary" disabled={pending || state.loading || Boolean(state.error) || Boolean(state.party)} onClick={() => start('RANK')}><Icon name="swords" />Tìm trận Rank</Button>{state.party && <small>Rời nhóm để tham gia đấu hạng.</small>}</article>
      <article className={styles.card}><header className={styles.cardHead}><span className={styles.modeIcon}><Icon name="casino" /></span><div className={styles.cardTitle}><span className={styles.eyebrow}>CASUAL TABLES</span><h2>Chơi thường</h2></div></header><p>Thư giãn một ván poker. Vào bàn nhanh hoặc rủ bạn bè cùng chơi.</p><ul><li>Chơi một mình hoặc cùng nhóm</li><li>Vào bàn khi ghép trận hoàn tất</li><li>Theo dõi hàng chờ ngay tại sảnh</li></ul><Button variant="primary" disabled={pending || state.loading || Boolean(state.error) || Boolean(state.party && state.party.leaderId !== user?.accountId)} onClick={() => start('NORMAL')}><Icon name="play_arrow" />{state.party ? 'Cả nhóm chơi nhanh' : 'Chơi nhanh'}</Button>{state.party && state.party.leaderId !== user?.accountId && <small>Chờ trưởng nhóm bắt đầu tìm trận.</small>}</article>
    </div>}
  </section>
}
