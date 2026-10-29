import { Eyebrow } from '@/shared/ui'
import InviteRow from './InviteRow'
import Panel from './Panel'
import styles from './RoomInvites.module.css'

// Invitations from friends, joined like a public room: the password is still asked when the room has one.
export default function RoomInvites({ invites, profiles, disabled, onJoin }) {
  return <Panel className={styles.panel} aria-label="Room invitations">
    <div><Eyebrow>INVITATIONS</Eyebrow><h2 className={styles.title}>Friends invited you</h2></div>
    <ul className={styles.list}>
      {invites.map(invite => <InviteRow key={invite.roomCode} invite={invite} disabled={disabled} onJoin={onJoin}
        inviter={profiles[invite.inviterId]?.displayName || `Player ${String(invite.inviterId).slice(-6)}`} />)}
    </ul>
  </Panel>
}
