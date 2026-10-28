import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router'
import { paths } from '@/shared/config/paths'
import { SoloTestButton } from '@/features/demo'
import { Icon } from '@/shared/ui'
import { useCommunity } from '../CommunityContext'
import FriendsPanel from './FriendsPanel'
import NotificationsPanel from './NotificationsPanel'
import styles from '../Community.module.css'
import ui from './FriendsPanel.module.css'
import { communityApi } from '../api/communityApi'
import { Avatar, Name } from './CommunityUI'

const tools = [['friends', 'forum', 'Tìm đội và bạn bè'], ['notifications', 'notifications', 'Thông báo']]

export function CommunityToolbar() {
  const { setPanel } = useCommunity()
  return <div className={styles.toolbar} aria-label="Kết nối người chơi"><div><span className={styles.eyebrow}>POKER LOUNGE</span><p>Cùng bàn chơi. Cùng kết nối.</p></div><div className={styles.actions}><SoloTestButton className={styles.tool} />{tools.filter(([key]) => key !== 'friends').map(([key, icon, label]) => <button type="button" className={styles.tool} key={key} onClick={() => setPanel(key)}><Icon name={icon} />{label}</button>)}</div></div>
}

export default function CommunityDock() {
  const { pathname } = useLocation()
  const { user, panel, setPanel, unreadCount, clearChat } = useCommunity()
  if (!user || pathname.startsWith('/admin')) return null
  return user ? <>{pathname !== paths.lobby && createPortal(<nav className={styles.dock} aria-label="Kết nối nhanh"><button className={styles.dockButton} type="button" aria-label="Tìm đội và bạn bè" onClick={() => { if (unreadCount) { clearChat(); setPanel('chat') } else setPanel('friends') }}><Icon name="forum" /><span>Tìm đội và bạn bè</span>{unreadCount > 0 && <span className={styles.unreadBadge} aria-label={`${unreadCount} tin nhắn chưa đọc`}>{unreadCount > 99 ? '99+' : unreadCount}</span>}</button></nav>, document.body)}<MessageAlert />{panel && <CommunityDialog key={panel === 'notifications' ? 'notifications' : 'community'} />}</> : null
}

function MessageAlert() {
  const { messageAlert, dismissMessageAlert, openChat } = useCommunity()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!messageAlert) return null
  async function open() {
    if (busy) return
    setBusy(true); setError('')
    try { openChat(await communityApi.conversation(messageAlert.conversationId)) }
    catch { setError('Chưa mở được. Thử lại trong danh sách trò chuyện.') }
    finally { setBusy(false) }
  }
  return createPortal(<aside className={styles.messageAlert} aria-label="Tin nhắn mới" aria-live="polite">
    <button className={styles.messageAlertOpen} type="button" disabled={busy} onClick={open} aria-label="Mở tin nhắn mới">
      <Avatar id={messageAlert.senderId} />
      <span className={styles.person}><strong><Name id={messageAlert.senderId} /></strong><span className={styles.messagePreview}>{messageAlert.content}</span><small className={styles.muted}>{error || 'Tin nhắn mới · Nhấn để xem'}</small></span>
    </button>
    <button className={styles.messageAlertClose} type="button" aria-label="Ẩn thông báo tin nhắn" onClick={dismissMessageAlert}><Icon name="close" /></button>
  </aside>, document.body)
}

function CommunityDialog() {
  const { panel, setPanel, unreadCount } = useCommunity()
  const dialog = useRef(null)
  const title = panel === 'notifications' ? 'Thông báo' : 'Bạn bè & tin nhắn'
  useEffect(() => {
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    function keyboard(event) {
      if (event.key === 'Escape') setPanel(null)
      if (event.key === 'Tab') {
        const elements = [...(dialog.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]') || [])].filter(element => element.getClientRects().length)
        const first = elements[0], last = elements.at(-1)
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', keyboard)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keyboard); previous?.focus() }
  }, [setPanel])
  return createPortal(<div className={styles.scrim} onClick={event => { if (event.target === event.currentTarget) setPanel(null) }}>
    <section className={styles.dialog} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={dialog}>
      <header className={panel === 'notifications' ? styles.dialogHead : ui.compactHeader}>
        {panel === 'notifications' ? <h2>Thông báo</h2> : <div className={ui.tabs} role="tablist" aria-label="Trò chuyện và bạn bè">
          <button type="button" role="tab" aria-label="Trò chuyện" aria-selected={panel === 'chat'} onClick={() => setPanel('chat')}>Trò chuyện{unreadCount > 0 && <span className={styles.unreadBadge} aria-label={`${unreadCount} tin nhắn chưa đọc`}>{unreadCount > 99 ? '99+' : unreadCount}</span>}</button>
          <button type="button" role="tab" aria-selected={panel === 'friends'} onClick={() => setPanel('friends')}>Bạn bè</button>
        </div>}
        <button className={styles.iconButton} type="button" aria-label="Đóng bảng kết nối" onClick={() => setPanel(null)}><Icon name="close" /></button>
      </header>
      <div className={styles.dialogBody}>{panel === 'notifications' ? <NotificationsPanel /> : <FriendsPanel />}</div>
    </section>
  </div>, document.body)
}
