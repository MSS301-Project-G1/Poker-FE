import { Button, Caption, Icon } from '@/shared/ui'
import { dateTime } from '../format'
import { moderationActions } from '../moderation'
import DetailSection from './DetailSection'

export default function ModerationPanel({ user, editable, onBan, onModerate }) {
  return <DetailSection title="Moderation">
    <p className={`mb-4 text-sm ${user.banned ? 'font-semibold text-error' : 'text-success'}`}>{user.banned
      ? `Banned ${user.bannedUntil ? `until ${dateTime(user.bannedUntil)}` : 'until an admin lifts it'} — ${user.banReason}` : 'Not banned'}</p>
    {!editable && <p className="mb-4 text-sm text-on-surface-variant">ADMIN accounts and your own account can’t be moderated.</p>}
    <div className="flex flex-wrap gap-2">
      <Button variant={user.banned ? 'primary' : 'danger'} disabled={!editable} onClick={onBan}>{user.banned ? 'Unban' : 'Ban'}</Button>
      {moderationActions.map(item => <Button key={item.action} disabled={!editable || !item.available(user)} onClick={() => onModerate(item)}>
        <Icon name={item.icon} />{item.label}</Button>)}
    </div>
    <Caption className="mt-3">Every action asks for a reason and is kept in the history. Players edit their own profile; admins only reset or remove content.</Caption>
  </DetailSection>
}
