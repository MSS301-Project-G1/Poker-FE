import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/shared/ui'
import { useCommunity } from '../CommunityContext'
import { communityApi as api } from '../api/communityApi'
import { useResource } from '../hooks/useResource'
import { Avatar, Empty, ErrorNotice, Name } from './CommunityUI'
import styles from '../Community.module.css'

const tabs = [['friends', 'Bạn bè'], ['incoming', 'Lời mời nhận'], ['outgoing', 'Đã gửi'], ['blocks', 'Đã chặn']]
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function FriendsPanel({ notifications = false }) {
  const { user, loadProfiles, openChat } = useCommunity()
  const [tab, setTab] = useState(notifications ? 'incoming' : 'friends')
  const [page, setPage] = useState(0)
  const [id, setId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const loader = useCallback(signal => tab === 'friends' ? api.friends(page, signal) : tab === 'blocks' ? api.blocks(page, signal) : api.requests(tab === 'incoming' ? 'INCOMING' : 'OUTGOING', page, signal), [tab, page])
  const { data, loading, error: readError, reload } = useResource(loader)
  const partyLoader = useCallback(signal => api.party(signal), [])
  const { data: party } = useResource(partyLoader, 5000)
  const rows = data?.items || []
  useEffect(() => { if (data) void loadProfiles(data.items.map(row => typeof row === 'string' ? row : row.requesterId === user?.accountId ? row.addresseeId : row.requesterId)) }, [data, loadProfiles, user?.accountId])

  async function run(operation, message) {
    if (busy) return
    setBusy(true); setError(''); setNotice('')
    try { await operation(); setNotice(message); reload() } catch (failure) { setError(failure.message) } finally { setBusy(false) }
  }
  async function chat(accountId) {
    await run(async () => openChat(await api.direct(accountId)), '')
  }
  return <div className={styles.stack}>
    {notifications ? <p className={styles.hint}>Lời mời đang chờ từ Social. Lịch sử thông báo và realtime sẽ được nối khi có cơ chế token socket.</p> : <>
      <div className={styles.tabs} role="tablist" aria-label="Quan hệ người chơi">{tabs.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? styles.tabActive : styles.tab} onClick={() => { setPage(0); setTab(key) }}>{label}</button>)}</div>
      <form className={styles.form} onSubmit={event => { event.preventDefault(); if (uuid.test(id.trim()) && id.trim() !== user?.accountId) void run(() => api.addFriend(id.trim()), 'Đã xử lý lời mời. Kiểm tra tab Bạn bè hoặc Đã gửi.') }}><label htmlFor="add-friend-id">Kết nối với người chơi</label><div className={styles.inline}><input className={styles.input} id="add-friend-id" placeholder="Nhập account ID (UUID)" value={id} onChange={event => setId(event.target.value)} /><Button type="submit" disabled={busy || !uuid.test(id.trim()) || id.trim() === user?.accountId}>Thêm bạn</Button></div></form>
    </>}
    <ErrorNotice message={error || readError} retry={readError ? reload : null} />
    {notice && <p className={styles.success} role="status">{notice}</p>}
    {loading ? <Empty>Đang tải người chơi…</Empty> : !rows.length ? <Empty>{tab === 'friends' ? 'Chưa có bạn bè. Gửi lời mời để bắt đầu kết nối.' : tab === 'blocks' ? 'Bạn chưa chặn người chơi nào.' : 'Không có lời mời trong danh sách này.'}</Empty> : <ul className={styles.list}>{rows.map(row => {
      const accountId = typeof row === 'string' ? row : row.requesterId === user?.accountId ? row.addresseeId : row.requesterId
      return <li className={styles.socialRow} key={typeof row === 'string' ? row : row.id}>
        <div className={styles.row}><Avatar id={accountId} /><span className={styles.person}><strong><Name id={accountId} /></strong><small className={styles.muted}>{row.status || accountId.slice(0, 8)}</small></span></div>
        <div className={styles.actions}>
          {tab === 'friends' && <><Button disabled={busy} onClick={() => chat(accountId)}>Nhắn tin</Button>{party?.leaderId === user?.accountId && !party.memberIds.includes(accountId) && <Button disabled={busy} onClick={() => run(() => api.invite(accountId), `Đã mời. Chia sẻ mã nhóm ${party.partyCode} cho người chơi.`)}>Mời nhóm</Button>}<button className={styles.link} type="button" disabled={busy} onClick={() => { if (window.confirm('Xóa người chơi này khỏi bạn bè?')) void run(() => api.removeFriend(accountId), 'Đã xóa bạn.') }}>Xóa bạn</button><button className={styles.dangerLink} type="button" disabled={busy} onClick={() => { if (window.confirm('Chặn người chơi và gỡ quan hệ bạn bè?')) void run(() => api.block(accountId), 'Đã chặn người chơi.') }}>Chặn</button></>}
          {tab === 'blocks' && <Button disabled={busy} onClick={() => run(() => api.unblock(accountId), 'Đã bỏ chặn. Quan hệ bạn bè không tự khôi phục.')}>Bỏ chặn</Button>}
          {row.status === 'PENDING' && tab === 'incoming' && <><Button variant="primary" disabled={busy} onClick={() => run(() => api.respond(row.id, 'accept'), 'Đã chấp nhận kết bạn.')}>Chấp nhận</Button><Button disabled={busy} onClick={() => run(() => api.respond(row.id, 'decline'), 'Đã từ chối.')}>Từ chối</Button></>}
          {row.status === 'PENDING' && tab === 'outgoing' && <Button disabled={busy} onClick={() => run(() => api.cancel(row.id), 'Đã hủy lời mời.')}>Hủy lời mời</Button>}
        </div>
      </li>
    })}</ul>}
    <nav className={styles.pagination} aria-label="Phân trang"><Button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Trước</Button><span>Trang {page + 1}</span><Button disabled={!data || page + 1 >= data.totalPages} onClick={() => setPage(value => value + 1)}>Sau</Button></nav>
  </div>
}
