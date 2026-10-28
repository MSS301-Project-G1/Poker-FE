import { useCommunity } from '@/features/community'
import { SoloTestButton } from '@/features/demo'
import { Icon } from '@/shared/ui'

const buttonClass = 'w-9 h-9 shrink-0 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-white transition-colors'

export default function LobbyHeaderActions({ isLobby, lobbyZen, onToggleLobbyZen }) {
  const { panel, setPanel, unreadCount, clearChat } = useCommunity()
  const cameraLabel = lobbyZen ? 'Hiện giao diện sảnh' : 'Toàn cảnh bàn 3D'
  return <>
    {isLobby && <>
      <SoloTestButton className={buttonClass} iconOnly />
      <button type="button" className={buttonClass} title={cameraLabel} aria-label={cameraLabel} aria-pressed={lobbyZen} onClick={onToggleLobbyZen}><Icon name={lobbyZen ? 'visibility' : 'photo_camera'} className="text-lg" /></button>
    </>}
    {isLobby && <button type="button" className={buttonClass + ' relative'} title="Tìm đội và bạn bè" aria-label="Tìm đội và bạn bè" aria-haspopup="dialog" aria-expanded={panel === 'friends' || panel === 'chat'} onClick={() => { if (unreadCount) { clearChat(); setPanel('chat') } else setPanel('friends') }}>
      <Icon name="forum" className="text-lg" />
      {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary-container text-white text-[10px] flex items-center justify-center" aria-label={unreadCount + ' tin nhắn chưa đọc'}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
    </button>}
    <button type="button" className={buttonClass} title="Thông báo" aria-label="Thông báo" aria-expanded={panel === 'notifications'} onClick={() => setPanel(panel === 'notifications' ? null : 'notifications')}><Icon name="notifications" className="text-lg" /></button>
  </>
}
