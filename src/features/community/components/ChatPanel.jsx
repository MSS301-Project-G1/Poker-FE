import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { useCommunity } from '../CommunityContext'
import { communityApi as api } from '../api/communityApi'
import { useResource } from '../hooks/useResource'
import { Avatar, Empty, ErrorNotice, Name } from './CommunityUI'
import styles from '../Community.module.css'

const sortedMessages = rows => [...new Map(rows.map(row => [row.id || row.clientMessageId, row])).values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || (a.id || '').localeCompare(b.id || ''))

export default function ChatPanel({ conversation, readOnly = false }) {
  return <ConversationChat key={conversation.id} conversation={conversation} readOnly={readOnly} />
}

function ConversationChat({ conversation, readOnly }) {
  const { user, loadProfiles, chatMessages, connection, registerVisibleChat } = useCommunity()
  useEffect(() => registerVisibleChat(conversation.id), [conversation.id, registerVisibleChat])
  const loader = useCallback(async signal => {
    const [room, history] = await Promise.all([api.conversation(conversation.id, signal), api.history(conversation.id, null, signal)])
    return { room, history }
  }, [conversation.id])
  const { data, error, loading, reload } = useResource(loader, connection.chat === 'connected' ? 15000 : 2500)
  const [draft, setDraft] = useState('')
  const [older, setOlder] = useState({ items: [], cursor: undefined })
  const [outgoing, setOutgoing] = useState([])
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState('')
  const [historyBusy, setHistoryBusy] = useState(false)
  const log = useRef(null)
  const atBottom = useRef(true)
  const closed = readOnly || Boolean(data?.room.closedAt)
  const messages = sortedMessages([...(data?.history.items || []), ...older.items, ...outgoing.filter(row => row.status === 'sent'), ...chatMessages.filter(row => row.conversationId === conversation.id)])
  const confirmed = new Set(messages.map(row => row.clientMessageId).filter(Boolean))
  const pending = outgoing.filter(row => row.status !== 'sent' && !confirmed.has(row.clientMessageId))
  const cursor = older.cursor === undefined ? data?.history.nextCursor : older.cursor
  const ids = data?.room.memberIds || conversation.memberIds
  useEffect(() => { void loadProfiles(ids) }, [ids, loadProfiles])
  const lastId = messages.at(-1)?.id
  useEffect(() => { if (atBottom.current && log.current) log.current.scrollTop = log.current.scrollHeight }, [lastId, pending.length])

  async function send(existing) {
    if (busy || closed || !data) return
    const content = existing?.content || draft.trim()
    if (!content || content.length > 2000) return
    const entry = existing || { clientMessageId: crypto.randomUUID(), conversationId: conversation.id, senderId: user.accountId, messageType: 'TEXT', content, createdAt: new Date().toISOString() }
    setBusy(true); setFailure(''); setDraft(''); atBottom.current = true
    setOutgoing(rows => [...rows.filter(row => row.clientMessageId !== entry.clientMessageId), { ...entry, status: 'pending' }])
    try {
      const sent = await api.send(conversation.id, { content: entry.content, messageType: 'TEXT', clientMessageId: entry.clientMessageId })
      setOutgoing(rows => rows.map(row => row.clientMessageId === entry.clientMessageId ? { ...sent, status: 'sent' } : row))
      reload()
    } catch (error) {
      setOutgoing(rows => rows.map(row => row.clientMessageId === entry.clientMessageId ? { ...row, status: 'failed' } : row))
      setFailure(error.message)
    } finally { setBusy(false) }
  }

  async function more() {
    if (!cursor || historyBusy) return
    setHistoryBusy(true); setFailure('')
    const previousHeight = log.current?.scrollHeight || 0
    try {
      const history = await api.history(conversation.id, cursor)
      atBottom.current = false
      setOlder(previous => ({ items: [...previous.items, ...history.items], cursor: history.nextCursor }))
      requestAnimationFrame(() => { if (log.current) log.current.scrollTop += log.current.scrollHeight - previousHeight })
    } catch (error) { setFailure(error.message) } finally { setHistoryBusy(false) }
  }

  const target = ids?.find(id => id !== user?.accountId)
  return <section className={styles.chat} aria-label="Cuộc trò chuyện">
    <header className={styles.chatHead}><Icon name={conversation.type === 'MATCH' ? 'casino' : 'forum'} /><div className={styles.person}><h3>{conversation.type === 'MATCH' ? 'Trò chuyện trong trận' : <Name id={target} />}</h3><small className={styles.muted}>{closed ? 'Trận đã kết thúc · Chỉ đọc' : connection.chat === 'connected' ? 'Đã kết nối · Trò chuyện trực tiếp' : 'Đang kết nối lại · Cập nhật định kỳ'}</small></div></header>
    <ErrorNotice message={failure || error} retry={reload} />
    <div ref={log} className={styles.chatLog} onScroll={() => { if (log.current) atBottom.current = log.current.scrollHeight - log.current.scrollTop - log.current.clientHeight < 60 }}>
      {cursor && <button className={styles.loadMore} type="button" disabled={historyBusy} onClick={more}>{historyBusy ? 'Đang tải…' : 'Xem tin nhắn cũ hơn'}</button>}
      {loading ? <Empty icon="chat_bubble">Đang tải cuộc trò chuyện…</Empty> : !messages.length && !pending.length ? <Empty icon="waving_hand">Gửi lời chào để bắt đầu cuộc trò chuyện.</Empty> : null}
      {[...messages, ...pending].map(row => <div key={row.id || row.clientMessageId} className={`${styles.message} ${row.senderId === user?.accountId ? styles.own : ''}`}>
        {row.senderId !== user?.accountId && <Avatar id={row.senderId} size="small" />}
        <div><div className={styles.bubble}>{row.content}</div><small className={styles.messageMeta}>{new Date(row.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{row.status === 'pending' ? ' · Đang gửi…' : ''}{row.status === 'failed' && <button type="button" disabled={busy || closed} className={styles.dangerLink} onClick={() => send(row)}> · Gửi lại</button>}</small></div>
      </div>)}
    </div>
    <form className={styles.composer} onSubmit={event => { event.preventDefault(); void send() }}>
      <textarea className={styles.input} aria-label="Nội dung tin nhắn" value={draft} maxLength={2000} placeholder={closed ? 'Cuộc trò chuyện chỉ đọc' : 'Nhập tin nhắn…'} disabled={closed || !data} rows={2} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send() } }} />
      <div className={styles.composerActions}><small className={styles.muted}>{draft.length}/2000 · Shift+Enter xuống dòng</small><Button variant="primary" type="submit" disabled={busy || closed || !data || !draft.trim()}>Gửi</Button></div>
    </form>
  </section>
}

export function MessagesPanel() {
  const { conversation, clearChat } = useCommunity()
  return conversation ? <><button className={styles.link} type="button" onClick={clearChat}>← Danh sách trò chuyện</button><ChatPanel conversation={conversation} /></> : <ConversationList />
}

function ConversationList() {
  const { user, openChat, loadProfiles, unreadMessages, chatMessages } = useCommunity()
  const [page, setPage] = useState(0)
  const loader = useCallback(signal => api.directConversations(page, signal), [page])
  const { data, loading, error, reload } = useResource(loader, 10000)
  const latestMessageId = chatMessages.at(-1)?.id
  useEffect(() => { if (latestMessageId) reload() }, [latestMessageId, reload])
  useEffect(() => { if (data) void loadProfiles(data.items.filter(row => row.type === 'DIRECT').flatMap(row => row.memberIds)) }, [data, loadProfiles])
  const rooms = (data?.items || []).filter(row => row.type === 'DIRECT')
  return <div className={styles.stack}>
    <ErrorNotice message={error} retry={reload} />
    {loading ? <Empty>Đang tải tin nhắn…</Empty> : !rooms.length ? <Empty icon="forum">Chưa có cuộc trò chuyện. Mở Bạn bè để bắt đầu nhắn tin.</Empty> : <ul className={styles.list}>{rooms.map(row => {
      const other = row.memberIds.find(id => id !== user?.accountId)
      const unread = unreadMessages[row.id] || 0
      const latest = chatMessages.findLast(message => message.conversationId === row.id)
      return <li key={row.id}><button type="button" className={`${styles.conversationRow} ${unread ? styles.unreadConversation : ''}`} onClick={() => openChat(row)}>
        <Avatar id={other} />
        <span className={styles.person}><strong><Name id={other} /></strong><small className={styles.messagePreview}>{latest ? `${latest.senderId === user?.accountId ? 'Bạn: ' : ''}${latest.content}` : 'Cuộc trò chuyện riêng'}</small></span>
        {unread > 0 ? <span className={styles.unreadBadge} aria-label={`${unread} tin nhắn chưa đọc`}>{unread > 99 ? '99+' : unread}</span> : <Icon name="chevron_right" />}
      </button></li>
    })}</ul>}
    {data?.totalPages > 1 && <nav className={styles.pagination} aria-label="Trang trò chuyện"><Button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Trước</Button><span>Trang {page + 1}</span><Button disabled={page + 1 >= data.totalPages} onClick={() => setPage(value => value + 1)}>Sau</Button></nav>}
  </div>
}

export function MatchChat({ matchId, finished }) {
  const loader = useCallback(async signal => {
    for (let page = 0; ; page++) {
      const result = await api.conversations(page, signal)
      const conversation = result.items.find(row => row.type === 'MATCH' && row.refId === matchId)
      if (conversation) return conversation
      if (page + 1 >= result.totalPages) return null
    }
  }, [matchId])
  const { data, error, reload, loading } = useResource(loader, 10000)
  return <div className={styles.matchChat}><ErrorNotice message={error} retry={reload} />{data ? <ChatPanel conversation={data} readOnly={finished} /> : <Empty icon="forum">{loading ? 'Đang tìm phòng chat trận…' : 'Phòng chat trận chưa sẵn sàng. Đang kiểm tra lại.'}</Empty>}</div>
}
