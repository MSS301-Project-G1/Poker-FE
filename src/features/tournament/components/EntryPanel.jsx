import { Button, Eyebrow, Icon } from '@/shared/ui'
import { formatCoins, formatFee, formatTime, holdsPlace, placeLabel, timeUntil } from '../format'
import Message from './Message'
import Panel from './Panel'
import styles from './EntryPanel.module.css'

/** What the player sees and can do now: open their table, accept an invitation, register or follow along. */
function entryView(tournament, me, myTableId, now) {
  const { type, status, startAt, entryFee, slots, entries, prizes } = tournament
  const open = status === 'SCHEDULED' && Date.parse(startAt) > now
  if (myTableId) return { icon: 'playing_cards', title: 'Your table is live', text: 'Your seat is waiting. Good luck!', action: 'table' }
  if (me?.finalPlace) {
    const prize = prizes[me.finalPlace - 1]
    return { icon: 'emoji_events', title: `You finished ${placeLabel(me.finalPlace)}`,
      text: prize ? `${formatCoins(prize)} go to your wallet.` : 'Thanks for playing the final.' }
  }
  if (status === 'CANCELLED') return { icon: 'event_busy', title: 'Tournament cancelled',
    text: me && holdsPlace(me) && entryFee > 0 ? 'Your entry fee is refunded to your wallet.' : 'This tournament will not be played.' }
  if (me?.status === 'ELIMINATED') return { icon: 'sports_score', title: 'Knocked out', text: 'You did not reach the final this time.' }
  if (me?.status === 'EXPIRED' || (me?.status === 'INVITED' && !(open && Date.parse(me.confirmBy) > now))) {
    return { icon: 'schedule', title: 'Invitation expired', text: 'The place went to the next player on the leaderboard.' }
  }
  if (me?.status === 'INVITED') return { icon: 'mark_email_unread', title: 'You are invited', action: 'confirm',
    text: `Accept by ${formatTime(me.confirmBy)} (${timeUntil(me.confirmBy, now)}) or the place goes to the next player.` }
  if (me && holdsPlace(me)) return open
    ? { icon: 'how_to_reg', title: 'You are in', text: `Your table opens at ${formatTime(startAt)}. Keep this page open to be taken there.` }
    : { icon: 'hourglass_top', title: 'Waiting for your table', text: 'Your table opens as soon as the round is ready.' }
  if (status === 'FINISHED') return { icon: 'emoji_events', title: 'Tournament finished', text: 'The final standings are in the bracket.' }
  if (!open) return { icon: 'live_tv', title: 'Under way', text: 'Entries are closed. Follow the tables in the bracket.' }
  if (type === 'ELITE') return { icon: 'workspace_premium', title: 'By invitation', action: 'leaderboard',
    text: `Invitations go to the top ${slots} players of the leaderboard shortly before the start.` }
  if (entries.filter(holdsPlace).length >= slots) return { icon: 'block', title: 'Tournament full', text: `All ${slots} places are taken.` }
  return { icon: 'confirmation_number', title: 'Places available', action: 'register',
    text: `Entry ${formatFee(entryFee)}. Places go to the first ${slots} players; the fee is refunded if the tournament is cancelled.` }
}

export default function EntryPanel({ tournament, me, myTableId, now, busy, error, onRegister, onConfirm, onOpenTable, onLeaderboard }) {
  const view = entryView(tournament, me, myTableId, now)
  return <Panel as="aside" className={styles.panel} aria-labelledby="entry-title">
    <Eyebrow>YOUR ENTRY</Eyebrow>
    <div className={styles.status}>
      <Icon name={view.icon} className={styles.icon} />
      <div className={styles.copy}>
        <h2 id="entry-title" className={styles.title}>{view.title}</h2>
        <p className={styles.muted}>{view.text}</p>
      </div>
    </div>
    {error && <Message tone="error">{error}</Message>}
    {view.action === 'table' && <Button variant="primary" className={styles.wide} onClick={onOpenTable}>Open your table</Button>}
    {view.action === 'confirm' && <Button variant="primary" className={styles.wide} disabled={busy} onClick={onConfirm}>
      {busy ? 'Accepting…' : 'Accept invitation'}</Button>}
    {view.action === 'register' && <Button variant="primary" className={styles.wide} disabled={busy} onClick={onRegister}>
      {busy ? 'Registering…' : `Register · ${formatFee(tournament.entryFee)}`}</Button>}
    {view.action === 'leaderboard' && <Button className={styles.wide} onClick={onLeaderboard}><Icon name="leaderboard" />Leaderboard</Button>}
  </Panel>
}
