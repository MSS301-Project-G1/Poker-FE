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

const labels = { incoming: 'Friend requests', outgoing: 'Sent requests', blocks: 'Blocked' }
const statuses = { ACCEPTED: 'Friends', DECLINED: 'Request declined', CANCELLED: 'Request cancelled' }

function MoreMenu({ label, text, children }) {
  return <details className={ui.menu} onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); event.currentTarget.open = false; event.currentTarget.querySelector('summary').focus() }
  }}>
    <summary aria-label={label}>{text ? <><span>{text}</span><Icon name="more_horiz" /></> : <Icon name="more_horiz" />}</summary>
    <div className={ui.menuBody} onClick={event => {
      if (event.target.closest('button')) event.currentTarget.closest('details').open = false
    }}>{children}</div>
  </details>
}
const removePrompt = name => ({
  title: 'Remove friend?', message: `${name} will be removed from your friends.`,
  confirmLabel: 'Remove friend', icon: 'person_remove', danger: true,
})
const blockPrompt = name => ({
  title: 'Block player?', message: `${name} will be removed from your friends. Unblocking later won’t restore the friendship.`,
  confirmLabel: 'Block', icon: 'block', danger: true,
})

export default function FriendsPanel({ notifications = false, onChanged }) {
  const { user, loadProfiles, openChat, profiles, panel, setPanel } = useCommunity()
  const confirm = useConfirm()
  const nameOf = accountId => profiles[accountId]?.displayName || 'This player'
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
      <button type="button" className={ui.toolbarButton} onClick={() => selectTab('outgoing')}><Icon name="outgoing_mail" />Sent requests</button>
      <button type="button" className={ui.toolbarButton} onClick={() => selectTab('blocks')}><Icon name="block" />Blocked</button>
    </div>
  if (tab === 'chat') return <MessagesPanel />
  if (notifications && !loading && !readError && !rows.length) return null
  return <div className={ui.panel}>
    {navigation}
    {!notifications && tab === 'friends' && <FindPlayers busy={busy} run={run} />}
    {tab !== 'friends' && <div className={ui.heading}>
      {['outgoing', 'blocks'].includes(tab) && <Button aria-label="Back to friends" onClick={() => selectTab('friends')}><Icon name="arrow_back" /></Button>}
      <h3>{labels[tab]}</h3>
    </div>}
    <ErrorNotice message={error || readError} retry={readError ? reload : null} />
    {notice && <p className={styles.success} role="status">{notice}</p>}
    {!notifications && tab === 'friends' && <FriendsPanel notifications onChanged={message => { setNotice(message); reload() }} />}
    {tab === 'friends' && <h3 className={ui.sectionTitle}>Friends list{data ? ` · ${data.totalElements}` : ''}</h3>}
    {loading ? <Empty>Loading players…</Empty> : !rows.length ? <Empty>{tab === 'friends' ? 'No friends yet. Find players to connect with.' : tab === 'blocks' ? 'You haven’t blocked anyone.' : 'No requests here.'}</Empty> : <ul className={ui.list}>{rows.map(row => {
      const accountId = typeof row === 'string' ? row : row.requesterId === user?.accountId ? row.addresseeId : row.requesterId
      const subtitle = row.status ? statuses[row.status] || (tab === 'incoming' ? 'Wants to be your friend' : 'Awaiting response') : tab === 'blocks' ? 'Blocked' : 'Friends'
      return <li className={ui.personRow} key={typeof row === 'string' ? row : row.id}>
        <Avatar id={accountId} />
        <div className={ui.person}><strong><Name id={accountId} /></strong><small>{subtitle}</small></div>
        <div className={ui.actions}>
          {tab === 'friends' && <><Button disabled={busy} onClick={() => chat(accountId)}>Message</Button><MoreMenu label={`Options for ${nameOf(accountId)}`}>
            <button type="button" disabled={busy} onClick={() => run(() => api.inviteParty(accountId), `Party invitation sent to ${nameOf(accountId)}.`)}><Icon name="sports_esports" />Invite to party</button>
            <button type="button" disabled={busy} onClick={async () => { if (await confirm(removePrompt(nameOf(accountId)))) void run(() => api.removeFriend(accountId), 'Friend removed.') }}><Icon name="person_remove" />Remove friend</button>
            <button className={ui.danger} type="button" disabled={busy} onClick={async () => { if (await confirm(blockPrompt(nameOf(accountId)))) void run(() => api.block(accountId), 'Player blocked.') }}><Icon name="block" />Block</button>
          </MoreMenu></>}
          {tab === 'blocks' && <Button disabled={busy} onClick={() => run(() => api.unblock(accountId), 'Unblocked. The friendship isn’t restored automatically.')}>Unblock</Button>}
          {row.status === 'PENDING' && tab === 'incoming' && <><Button variant="primary" disabled={busy} onClick={() => run(() => api.respond(row.id, 'accept'), 'Friend request accepted.')}>Accept</Button><Button disabled={busy} onClick={() => run(() => api.respond(row.id, 'decline'), 'Declined.')}>Decline</Button></>}
          {row.status === 'PENDING' && tab === 'outgoing' && <Button disabled={busy} onClick={() => run(() => api.cancel(row.id), 'Request cancelled.')}>Cancel request</Button>}
        </div>
      </li>
    })}</ul>}
    {data?.totalPages > 1 && <nav className={ui.pagination} aria-label="Pagination"><Button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</Button><span>{page + 1} / {data.totalPages}</span><Button disabled={page + 1 >= data.totalPages} onClick={() => setPage(value => value + 1)}>Next</Button></nav>}
  </div>
}
