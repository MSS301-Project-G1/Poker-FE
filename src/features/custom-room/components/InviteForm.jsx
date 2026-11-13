import { FriendPicker } from '@/features/community'
import styles from './InviteForm.module.css'

// Friends only: competition-service refuses room invites to anyone who isn't a friend.
export default function InviteForm({ memberIds, disabled, onInvite }) {
  return <section className={styles.invite} aria-label="Invite a friend">
    <span className={styles.title}>Invite a friend</span>
    <FriendPicker joinedIds={memberIds} onPick={onInvite} disabled={disabled} />
  </section>
}
