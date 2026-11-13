import { dateTime, fieldGridClass, titleCase } from '../format'
import DetailField from './DetailField'
import DetailSection from './DetailSection'

const restriction = (label, until) => until ? `${label} until ${dateTime(until)}` : null

export default function AccountSection({ user, adminId }) {
  const restrictions = [restriction('Chat', user.chatBannedUntil), restriction('Rank', user.rankBannedUntil)].filter(Boolean)
  return <DetailSection title="Account">
    <dl className={fieldGridClass}>
      <DetailField label="Role">{user.role}{user.accountId === adminId ? ' (you)' : ''}</DetailField>
      <DetailField label="Status">{titleCase(user.accountStatus)}</DetailField>
      <DetailField label="Email">{user.email} · {user.emailVerified ? 'verified' : 'not verified'}</DetailField>
      <DetailField label="Player code">{user.playerCode}</DetailField>
      <DetailField label="Account ID"><span className="break-all text-sm">{user.accountId}</span></DetailField>
      <DetailField label="First login reward">{user.firstLoginRewarded ? 'Received' : 'Not yet'}</DetailField>
      <DetailField label="Created">{dateTime(user.createdAt)}</DetailField>
      <DetailField label="Last updated">{dateTime(user.updatedAt)}</DetailField>
      <DetailField label="Chat / Rank restriction">{restrictions.length ? restrictions.join(' · ') : 'None'}</DetailField>
    </dl>
  </DetailSection>
}
