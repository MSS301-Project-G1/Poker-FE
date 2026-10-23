import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { SoloTestButton } from '@/features/demo'
import { Icon } from '@/shared/ui'
import { useCommunity } from '../CommunityContext'
import FriendsPanel from './FriendsPanel'
import { MessagesPanel } from './ChatPanel'
import NotificationsPanel from './NotificationsPanel'
import styles from '../Community.module.css'

const tools = [['friends', 'group', 'Bạn bè'], ['chat', 'forum', 'Tin nhắn'], ['notifications', 'notifications', 'Thông báo']]

export function CommunityToolbar() {
  const { setPanel } = useCommunity()
  return <div className={styles.toolbar} aria-label="Kết nối người chơi"><div><span className={styles.eyebrow}>POKER LOUNGE</span><p>Cùng bàn chơi. Cùng kết nối.</p></div><div className={styles.actions}><SoloTestButton className={styles.tool} />{tools.map(([key, icon, label]) => <button type="button" className={styles.tool} key={key} onClick={() => setPanel(key)}><Icon name={icon} />{label}</button>)}</div></div>
}

export default function CommunityDock({ showLauncher = true }) {
  const { user, panel, setPanel } = useCommunity()
  return user ? <>{showLauncher && <nav className={styles.dock} aria-label="Kết nối nhanh">{tools.map(([key, icon, label]) => <button className={styles.dockButton} type="button" key={key} aria-label={`Mở ${label.toLowerCase()}`} onClick={() => setPanel(key)}><Icon name={icon} /><span>{label}</span></button>)}</nav>}{panel && <CommunityDialog key={panel} />}</> : null
}

function CommunityDialog() {
  const { panel, setPanel } = useCommunity()
  const dialog = useRef(null)
  const title = panel === 'friends' ? 'Bạn bè & kết nối' : panel === 'chat' ? 'Tin nhắn' : 'Thông báo'
  useEffect(() => {
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    function keyboard(event) {
      if (event.key === 'Escape') setPanel(null)
      if (event.key === 'Tab') {
        const elements = [...(dialog.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]') || [])]
        const first = elements[0], last = elements.at(-1)
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', keyboard)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keyboard); previous?.focus() }
  }, [setPanel])
  return createPortal(<div className={styles.scrim} onClick={event => { if (event.target === event.currentTarget) setPanel(null) }}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="community-title" tabIndex={-1} ref={dialog}><header className={styles.dialogHead}><div><span className={styles.eyebrow}>PLAYER COMMUNITY</span><h2 id="community-title">{title}</h2></div><button className={styles.iconButton} type="button" aria-label="Đóng bảng kết nối" onClick={() => setPanel(null)}><Icon name="close" /></button></header><div className={styles.dialogBody}>{panel === 'friends' ? <FriendsPanel /> : panel === 'chat' ? <MessagesPanel /> : <NotificationsPanel />}</div></section></div>, document.body)
}
