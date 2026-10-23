import { useCallback, useEffect, useState } from 'react'
import { Button, Icon, useConfirm } from '@/shared/ui'
import { useCommunity } from '../CommunityContext'
import { communityApi as api } from '../api/communityApi'
import { useResource } from '../hooks/useResource'
import { Avatar, Empty, ErrorNotice, Name } from './CommunityUI'
import styles from '../Community.module.css'
import FindPlayers from './FindPlayers'
import ui from './FriendsPanel.module.css'
import { MessagesPanel } from './ChatPanel'

const labels = { incoming: 'Lời mời kết bạn', outgoing: 'Lời mời đã gửi', blocks: 'Người đã chặn' }
const statuses = { ACCEPTED: 'Đã kết bạn', DECLINED: 'Lời mời đã được từ chối', CANCELLED: 'Lời mời đã hủy' }

function MoreMenu({ label, children }) {
  return <details className={ui.menu} onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); event.currentTarget.open = false; event.currentTarget.querySelector('summary').focus() }
  }}>
    <summary aria-label={label}><Icon name="more_horiz" /></summary>
    <div className={ui.menuBody} onClick={event => {
      if (event.target.closest('button')) event.currentTarget.closest('details').open = false
    }}>{children}</div>
  </details>
}
const removePrompt = name => ({
  title: 'Xóa bạn?', message: `${name} sẽ bị xóa khỏi danh sách bạn bè của bạn.`,
  confirmLabel: 'Xóa bạn', icon: 'person_remove', danger: true,
})
const blockPrompt = name => ({
  title: 'Chặn người chơi?', message: `${name} sẽ bị gỡ khỏi danh sách bạn bè. Nếu bỏ chặn sau này, quan hệ bạn bè không tự khôi phục.`,
  confirmLabel: 'Chặn', icon: 'block', danger: true,
})

export default function FriendsPanel({ notifications = false, onChanged }) {
  const { user, loadProfiles, openChat, profiles, panel, setPanel } = useCommunity()
  const confirm = useConfirm()
  const nameOf = accountId => profiles[accountId]?.displayName || 'Người chơi này'
  const [friendTab, setTab] = useState(notifications ? 'incoming' : 'friends')
  const tab = !notifications && panel === 'chat' ? 'chat' : friendTab
  const [page, setPage] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const loader = useCallback(signal => tab === 'chat' ? Promise.resolve(null) : tab === 'friends' ? api.friends(page, signal) : tab === 'blocks' ? api.blocks(page, signal) : api.requests(tab === 'incoming' ? 'INCOMING' : 'OUTGOING', page, signal), [tab, page])
  const { data, loading, error: readError, reload } = useResource(loader)
  const rows = (data?.items || []).filter(row => !notifications || row.status === 'PENDING')
  useEffect(() => { if (data) void loadProfiles(data.items.map(row => typeof row === 'string' ? row : row.requesterId === user?.accountId ? row.addresseeId : row.requesterId)) }, [data, loadProfiles, user?.accountId])

  async function run(operation, message) {
    if (busy) return
    setBusy(true); setError(''); setNotice('')
    try { await operation(); setNotice(message); reload(); onChanged?.(message) } catch (failure) { setError(failure.message) } finally { setBusy(false) }
  }
  async function chat(accountId) {
    await run(async () => openChat(await api.direct(accountId)), '')
  }
  function selectTab(next) { if (!notifications) setPanel(next === 'chat' ? 'chat' : 'friends'); if (next !== 'chat') setTab(next); setPage(0); setError(''); setNotice('') }
  const navigation = !notifications && <div className={ui.toolbar}>
      <MoreMenu label="Tùy chọn bạn bè">
        <button type="button" onClick={() => selectTab('outgoing')}><Icon name="outgoing_mail" />Lời mời đã gửi</button>
        <button type="button" onClick={() => selectTab('blocks')}><Icon name="block" />Người đã chặn</button>
      </MoreMenu>
    </div>
  if (tab === 'chat') return <MessagesPanel />
  if (notifications && !loading && !readError && !rows.length) return null
  return <div className={ui.panel}>
    {navigation}
    {!notifications && tab === 'friends' && <FindPlayers busy={busy} run={run} />}
    {tab !== 'friends' && <div className={ui.heading}>
      {['outgoing', 'blocks'].includes(tab) && <Button aria-label="Quay lại bạn bè" onClick={() => selectTab('friends')}><Icon name="arrow_back" /></Button>}
      <h3>{labels[tab]}</h3>
    </div>}
    <ErrorNotice message={error || readError} retry={readError ? reload : null} />
    {notice && <p className={styles.success} role="status">{notice}</p>}
    {!notifications && tab === 'friends' && <FriendsPanel notifications onChanged={message => { setNotice(message); reload() }} />}
    {tab === 'friends' && <h3 className={ui.sectionTitle}>Danh sách bạn bè{data ? ` · ${data.totalElements}` : ''}</h3>}
    {loading ? <Empty>Đang tải người chơi…</Empty> : !rows.length ? <Empty>{tab === 'friends' ? 'Chưa có bạn bè. Tìm người chơi để bắt đầu kết nối.' : tab === 'blocks' ? 'Bạn chưa chặn người chơi nào.' : 'Không có lời mời trong danh sách này.'}</Empty> : <ul className={ui.list}>{rows.map(row => {
      const accountId = typeof row === 'string' ? row : row.requesterId === user?.accountId ? row.addresseeId : row.requesterId
      const subtitle = row.status ? statuses[row.status] || (tab === 'incoming' ? 'Muốn kết bạn với bạn' : 'Đang chờ phản hồi') : tab === 'blocks' ? 'Đã chặn' : 'Bạn bè'
      return <li className={ui.personRow} key={typeof row === 'string' ? row : row.id}>
        <Avatar id={accountId} />
        <div className={ui.person}><strong><Name id={accountId} /></strong><small>{subtitle}</small></div>
        <div className={ui.actions}>
          {tab === 'friends' && <><Button disabled={busy} onClick={() => chat(accountId)}>Nhắn tin</Button><MoreMenu label={`Tùy chọn với ${nameOf(accountId)}`}>
            <button type="button" disabled={busy} onClick={async () => { if (await confirm(removePrompt(nameOf(accountId)))) void run(() => api.removeFriend(accountId), 'Đã xóa bạn.') }}><Icon name="person_remove" />Xóa bạn</button>
            <button className={ui.danger} type="button" disabled={busy} onClick={async () => { if (await confirm(blockPrompt(nameOf(accountId)))) void run(() => api.block(accountId), 'Đã chặn người chơi.') }}><Icon name="block" />Chặn</button>
          </MoreMenu></>}
          {tab === 'blocks' && <Button disabled={busy} onClick={() => run(() => api.unblock(accountId), 'Đã bỏ chặn. Quan hệ bạn bè không tự khôi phục.')}>Bỏ chặn</Button>}
          {row.status === 'PENDING' && tab === 'incoming' && <><Button variant="primary" disabled={busy} onClick={() => run(() => api.respond(row.id, 'accept'), 'Đã chấp nhận kết bạn.')}>Chấp nhận</Button><Button disabled={busy} onClick={() => run(() => api.respond(row.id, 'decline'), 'Đã từ chối.')}>Từ chối</Button></>}
          {row.status === 'PENDING' && tab === 'outgoing' && <Button disabled={busy} onClick={() => run(() => api.cancel(row.id), 'Đã hủy lời mời.')}>Hủy lời mời</Button>}
        </div>
      </li>
    })}</ul>}
    {data?.totalPages > 1 && <nav className={ui.pagination} aria-label="Phân trang"><Button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Trước</Button><span>{page + 1} / {data.totalPages}</span><Button disabled={page + 1 >= data.totalPages} onClick={() => setPage(value => value + 1)}>Sau</Button></nav>}
  </div>
}
