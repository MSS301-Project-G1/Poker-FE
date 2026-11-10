import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '@/features/auth'
import { Button, Icon, useToast } from '@/shared/ui'
import { paths } from '@/shared/config/paths'
import { PartyPanel, useLeaveParty, useParty } from '@/features/community'
import { useQueue } from './MatchmakingContext'
import MatchRadar from './components/MatchRadar'
import QueueRoster from './components/QueueRoster'
import ProposalTable from './components/ProposalTable'
import styles from './RankedPage.module.css'

const clock = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

export default function RankedPage() {
  const [params] = useSearchParams()
  const state = useQueue()
  const { user } = useAuth()
  const navigate = useNavigate()
  const notify = useToast()
  const lastParty = useRef(null)
  const leaveParty = useLeaveParty()
  const [leaving, setLeaving] = useState(false)
  const [now, setNow] = useState(Date.now)
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(timer) }, [])
  const partyRequested = params.get('mode') === 'PARTY'
  const mode = state.activeMode || (['NORMAL', 'PARTY'].includes(params.get('mode')) ? 'NORMAL' : 'RANK')
  const partyState = useParty(mode === 'NORMAL')
  const party = partyState.data?.partyId ? partyState.data : null
  useEffect(() => {
    if (mode !== 'NORMAL') { lastParty.current = null; return }
    if (partyState.loading || partyState.error) return
    if (party) { lastParty.current = party.partyId; return }
    if (lastParty.current) {
      lastParty.current = null
      notify('Nhóm đã giải tán hoặc bạn không còn là thành viên. Đã trở về lobby.')
      navigate(paths.lobby, { replace: true })
    }
  }, [mode, party, partyState.loading, partyState.error, notify, navigate])
  const isParty = mode === 'NORMAL' && (partyRequested || Boolean(party))
  const canManageParty = !isParty || party?.leaderId === user?.accountId
  const current = mode === 'NORMAL' ? state.normal : state.rank
  const queue = current.queue
  const status = queue?.status
  const idle = status === 'NONE' || status === 'FAILED'
  const proposed = status === 'PROPOSED'
  const deadline = proposed ? queue?.acceptDeadline : queue?.matchStartDeadline
  const remaining = deadline ? Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000)) : null
  const elapsed = queue?.joinedAt ? Math.floor(Math.max(0, now - Date.parse(queue.joinedAt)) / 1000) : 0
  const max = Math.max(2, Math.min(10, queue?.maxPlayers || 6))
  const preparing = idle || !queue
  const roster = preparing ? { status: isParty ? 'PARTY' : 'PREPARING', playerIds: isParty ? party?.memberIds || [] : [user.accountId], leaderId: party?.leaderId } : queue
  const count = Math.max(0, preparing ? roster.playerIds.length : queue?.playerCount ?? queue?.playerIds?.length ?? 0)
  const inMatch = status === 'READY' && Boolean(queue?.tableId)
  // Back to the lobby also takes you out of your party, so the lobby no longer keeps you in the party room.
  async function backToLobby() {
    if (!party) { navigate(paths.lobby); return }
    setLeaving(true)
    try {
      const message = await leaveParty(party.leaderId === user?.accountId)
      if (message) { notify(message); navigate(paths.lobby) }
    } catch (failure) { notify(failure.message) } finally { setLeaving(false) }
  }
  async function cancel() {
    if (await current.leave()) { state.close(); if (!isParty) navigate(paths.lobby) }
  }
  if (['PROPOSED', 'CREATING_TABLE'].includes(status) && queue?.proposalId) return <ProposalTable key={queue.proposalId} queue={queue} user={user} current={current} state={state} remaining={remaining} mode={mode} />
  return <div className={styles.page}>
    <section className={styles.panel} aria-label="Chuẩn bị trận đấu">
      <header className={styles.header}>
        <div className={styles.heading}><span className={styles.emblem}><Icon name={isParty ? 'groups' : 'military_tech'} /></span><div><p className={styles.eyebrow}>{isParty ? 'PARTY · NORMAL' : mode === 'RANK' ? 'RANK' : 'NORMAL'} · {max}-MAX NO-LIMIT HOLD’EM</p><h1>{isParty ? 'Phòng nhóm' : mode === 'RANK' ? 'Ranked Match' : 'Normal Match'}</h1></div></div>
        <div className={styles.mode}>{isParty ? 'PARTY · CHƠI THƯỜNG' : mode === 'RANK' ? 'RANK · SOLO' : 'NORMAL · SOLO'}</div>
      </header>
      <div className={styles.main}>
        <MatchRadar elapsed={clock(status === 'COUNTDOWN' && remaining != null ? remaining : elapsed)} title={status === 'COUNTDOWN' ? 'CHỜ THÊM NGƯỜI CHƠI' : preparing ? isParty ? 'CHỜ BẠN BÈ VÀO NHÓM' : 'READY TO SEARCH' : 'SEARCHING TABLE'} active={!preparing} detail={status === 'COUNTDOWN' ? 'Hết giờ sẽ chuyển sang bàn xác nhận' : preparing && isParty ? 'Chia sẻ mã và mật khẩu. Trưởng nhóm bắt đầu tìm trận khi sẵn sàng.' : queue?.position != null ? `Vị trí trong hàng: #${queue.position}` : 'Trạng thái được cập nhật từ máy chủ'} />
        <aside className={styles.side}>
          {!isParty && <div className={styles.performance}><div className={styles.sectionTitle}><Icon name="hotel_class" /><h2>THÔNG TIN GHÉP TRẬN</h2></div>
            <div className={styles.stats}><div><span>{preparing && isParty ? 'Thành viên nhóm' : 'Người đang chờ'}</span><strong>{count} / {max}</strong><i /></div><div><span>Tối thiểu mở bàn</span><strong>{queue?.minPlayers ?? '—'}</strong><i /></div></div>
            <div className={styles.player}><Icon name="person" /><div><strong>{user?.profile?.displayName || user?.email || 'Bạn'}</strong><p>{mode === 'RANK' ? 'Ghép theo Elo · Cần xác nhận trận' : 'Chơi một mình hoặc cùng nhóm'}</p></div></div>
          </div>}
          {isParty && <PartyPanel room />}
        </aside>
      </div>
      <div className={styles.gathering}>
        <div className={styles.progress}><strong>{preparing && isParty ? 'THÀNH VIÊN NHÓM' : 'TABLE GATHERING PROGRESS'} <b>{count}/{max}</b></strong><span>{preparing ? isParty ? 'Sẵn sàng cùng nhóm tìm trận Normal' : 'Sẵn sàng tham gia hàng chờ' : 'Đang cập nhật tiến trình ghép trận…'}</span></div>
        <QueueRoster queue={roster} user={user} max={max} count={count} />
      </div>
      {current.error && <p className={styles.error} role="alert">{current.error}</p>}
      {partyState.error && <p className={styles.error} role="alert">{partyState.error}</p>}
      <footer className={styles.footer}><span><Icon name="lock" /><span>{isParty ? canManageParty ? 'Trưởng nhóm bắt đầu và hủy tìm trận cho cả nhóm' : 'Chờ trưởng nhóm bắt đầu tìm trận' : 'Xác nhận và tạo bàn do máy chủ xử lý'}</span></span><div className={styles.actions}>
        {idle && <><Button disabled={leaving} onClick={backToLobby}>Về lobby</Button><Button variant="primary" disabled={state.pending || !canManageParty || (mode === 'NORMAL' && (partyState.loading || Boolean(partyState.error))) || (isParty && !party)} onClick={() => state.start(mode)}>{isParty ? 'Tìm trận cùng nhóm' : 'Tìm trận'}</Button></>}
        {['WAITING', 'COUNTDOWN'].includes(status) && <Button disabled={state.pending || !canManageParty || state.leaderOnly} onClick={cancel}>Hủy tìm trận</Button>}
        {proposed && <><Button disabled={state.pending || remaining === 0} onClick={state.decline}>Từ chối</Button><Button variant="primary" disabled={state.pending || current.accepted || remaining === 0} onClick={state.accept}>{current.accepted ? 'Đã xác nhận' : 'Chấp nhận trận'}</Button></>}
        {inMatch && <Button variant="primary" onClick={() => navigate(paths.tableById(queue.tableId))}>Quay lại bàn</Button>}
      </div></footer>
    </section>
  </div>
}
