import { Button } from '@/shared/ui'
import InviteForm from './InviteForm'
import Message from './Message'
import Panel from './Panel'
import styles from './RoomControls.module.css'

// Host: start once everyone else is ready. Guest: toggle ready. Everyone: invite and leave while waiting.
export default function RoomControls({ room, me, isOwner, busy, error, onStart, onReady, onInvite, onLeave }) {
  const waiting = room.status === 'WAITING'
  const others = room.members.filter(member => !member.owner)
  const canStart = waiting && room.members.length >= 2 && others.every(member => member.ready)
  const hint = room.members.length < 2 ? 'Waiting for at least one more player.'
    : canStart ? 'Everyone is ready.' : 'Waiting for every player to be ready.'

  return <Panel as="aside" className={styles.controls} aria-label="Room controls">
    {error && <Message tone="error">{error}</Message>}
    {waiting && isOwner && <>
      <Button variant="primary" className={styles.wide} disabled={busy || !canStart} onClick={onStart}>Start match</Button>
      <p className={styles.muted}>{hint}</p>
    </>}
    {waiting && me && !isOwner && <Button variant={me.ready ? 'secondary' : 'primary'} className={styles.wide} disabled={busy}
      onClick={() => onReady(!me.ready)}>{me.ready ? 'Not ready' : "I'm ready"}</Button>}
    <InviteForm disabled={busy} onInvite={onInvite} />
    <Button className={styles.leave} disabled={busy || !waiting} onClick={onLeave}>Leave room</Button>
  </Panel>
}
