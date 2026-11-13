import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Button, Icon } from '@/shared/ui'
import { useCommunity } from '../CommunityContext'
import { communityApi as api } from '../api/communityApi'
import { useResource } from '../hooks/useResource'
import { ALREADY_IN_PARTY, readPartyInvite } from '../partyInvite'
import { Avatar, Empty, ErrorNotice, Name } from './CommunityUI'
import styles from '../Community.module.css'

// One click joins with the invite's code and password; the server's reason is shown when it refuses
// (wrong password after a kick, party full or already searching). Being in that same party just opens it.
function PartyInviteJoin({ invite }) {
  const navigate = useNavigate()
  const { setPanel } = useCommunity()
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState('')
  const openRoom = () => { setPanel(null); navigate(`${paths.ranked}?mode=PARTY`) }
  async function join() {
    setBusy(true); setFailure('')
    try {
      await api.joinParty(invite.partyCode, invite.password)
      openRoom()
    } catch (error) {
      const current = error.code === ALREADY_IN_PARTY ? await api.party().catch(() => null) : null
      if (current?.partyCode === invite.partyCode) openRoom()
      else setFailure(error.message)
    } finally { setBusy(false) }
  }
  return <div className={styles.inviteAction}>
    <Button size="sm" variant="primary" icon="group_add" loading={busy} onClick={() => void join()}>Join party</Button>
    {failure && <small className={styles.inviteError} role="alert">{failure}</small>}
  </div>
}

const sortedMessages = rows => [...new Map(rows.map(row => [row.id || row.clientMessageId, row])).values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || (a.id || '').localeCompare(b.id || ''))
const emotes = ['😀', '😂', '🤣', '😊', '😍', '😎', '🤔', '😅', '😭', '😡', '🤝', '👏', '🔥', '💯', '🎉', '❤️', '💔', '👋', '👍', '👎', '🎲', '🃏', '♠️', '♥️', '♦️', '♣️']

export default function ChatPanel({ conversation, readOnly = false, showBack = false }) {
  return <ConversationChat key={conversation.id} conversation={conversation} readOnly={readOnly} showBack={showBack} />
}

function ConversationChat({ conversation, readOnly, showBack }) {
  const { user, loadProfiles, chatMessages, connection, registerVisibleChat, clearChat } = useCommunity()
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
  const [showEmotes, setShowEmotes] = useState(false)
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
      if (error.code === 'CHAT_CONTENT_NOT_ALLOWED') {
        setOutgoing(rows => rows.filter(row => row.clientMessageId !== entry.clientMessageId))
        setDraft(current => current || entry.content)
        setFailure('Your message contains inappropriate language. Please edit it before sending.')
      } else {
        setOutgoing(rows => rows.map(row => row.clientMessageId === entry.clientMessageId ? { ...row, status: 'failed' } : row))
        setFailure(error.message)
      }
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
  return <section className={styles.chat} aria-label="Conversation">
    <header className={styles.chatHead}><div className={styles.chatIdentity}>{showBack && <button type="button" className={styles.chatBack} onClick={() => clearChat()}>← All conversations</button>}<Icon name={conversation.type === 'MATCH' ? 'casino' : conversation.type === 'WORLD' ? 'public' : 'forum'} /><div className={styles.person}><h3>{conversation.type === 'MATCH' ? 'Match chat' : conversation.type === 'WORLD' ? 'World chat' : <Name id={target} />}</h3><small className={styles.muted}>{closed ? 'Match ended · Read only' : connection.chat === 'connected' ? 'Connected · Live chat' : 'Reconnecting · Refreshing periodically'}</small></div></div></header>
    <ErrorNotice message={failure || error} retry={reload} />
    <div ref={log} className={styles.chatLog} onScroll={() => { if (log.current) atBottom.current = log.current.scrollHeight - log.current.scrollTop - log.current.clientHeight < 60 }}>
      {cursor && <button className={styles.loadMore} type="button" disabled={historyBusy} onClick={more}>{historyBusy ? 'Loading…' : 'Load older messages'}</button>}
      {loading ? <Empty icon="chat_bubble">Loading conversations…</Empty> : !messages.length && !pending.length ? <Empty icon="waving_hand">Say hello to start the conversation.</Empty> : null}
      {[...messages, ...pending].map(row => { const invite = conversation.type === 'DIRECT' && row.senderId !== user?.accountId ? readPartyInvite(row.content) : null; return <div key={row.id || row.clientMessageId} className={`${styles.message} ${row.senderId === user?.accountId ? styles.own : ''}`}>
        {row.senderId !== user?.accountId && <Avatar id={row.senderId} size="small" />}
        <div><div className={styles.bubble}>{row.content}{invite && <PartyInviteJoin invite={invite} />}</div><small className={styles.messageMeta}>{new Date(row.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}{row.status === 'pending' ? ' · Sending…' : ''}{row.status === 'failed' && <button type="button" disabled={busy || closed} className={styles.dangerLink} onClick={() => send(row)}> · Retry</button>}</small></div>
      </div> })}
    </div>
    <form className={styles.composer} onSubmit={event => { event.preventDefault(); void send() }}>
      <div className={styles.inputWrap}>
        <textarea className={styles.input} aria-label="Message" value={draft} maxLength={2000} placeholder={closed ? 'Read-only conversation' : 'Type a message…'} disabled={closed || !data} rows={2} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send() } }} />
        <button type="button" className={styles.emoteButton} aria-label="Add emoji" aria-expanded={showEmotes} disabled={closed || !data} onClick={() => setShowEmotes(value => !value)}>☺</button>
        {showEmotes && <div className={styles.emotePicker} role="listbox" aria-label="Emoji picker">{emotes.map(emote => <button key={emote} type="button" role="option" aria-label={`Insert ${emote}`} onClick={() => { setDraft(value => `${value}${emote}`); setShowEmotes(false) }}>{emote}</button>)}</div>}
      </div>
      <div className={styles.composerActions}><small className={styles.muted}>{draft.length}/2000 · Shift+Enter for a new line</small><Button variant="primary" type="submit" disabled={busy || closed || !data || !draft.trim()}>Send</Button></div>
    </form>
  </section>
}

export function MessagesPanel() {
  const { conversation } = useCommunity()
  return conversation ? <ChatPanel conversation={conversation} showBack /> : <ConversationList />
}

export function WorldChat() {
  const [room, setRoom] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { let alive = true; api.world().then(value => { if (alive) setRoom(value) }).catch(value => { if (alive) setError(value.message) }); return () => { alive = false } }, [])
  return room ? <ChatPanel conversation={room} /> : <ErrorNotice message={error || 'Opening world chat…'} />
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
    {loading ? <Empty>Loading messages…</Empty> : !rooms.length ? <Empty icon="forum">No conversations yet. Open Friends to start messaging.</Empty> : <ul className={styles.list}>{rooms.map(row => {
      const other = row.memberIds.find(id => id !== user?.accountId)
      const unread = unreadMessages[row.id] || 0
      const latest = chatMessages.findLast(message => message.conversationId === row.id)
      return <li key={row.id}><button type="button" className={`${styles.conversationRow} ${unread ? styles.unreadConversation : ''}`} onClick={() => openChat(row)}>
        <Avatar id={other} />
        <span className={styles.person}><strong><Name id={other} /></strong><small className={styles.messagePreview}>{latest ? `${latest.senderId === user?.accountId ? 'You: ' : ''}${latest.content}` : 'Direct message'}</small></span>
        {unread > 0 ? <span className={styles.unreadBadge} aria-label={`${unread} unread message${unread === 1 ? '' : 's'}`}>{unread > 99 ? '99+' : unread}</span> : <Icon name="chevron_right" />}
      </button></li>
    })}</ul>}
    {data?.totalPages > 1 && <nav className={styles.pagination} aria-label="Chat pages"><Button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</Button><span>Page {page + 1}</span><Button disabled={page + 1 >= data.totalPages} onClick={() => setPage(value => value + 1)}>Next</Button></nav>}
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
  return <div className={styles.matchChat}><ErrorNotice message={error} retry={reload} />{data ? <ChatPanel conversation={data} readOnly={finished} /> : <Empty icon="forum">{loading ? 'Finding the match chat…' : 'Match chat isn’t ready yet. Checking again.'}</Empty>}</div>
}
