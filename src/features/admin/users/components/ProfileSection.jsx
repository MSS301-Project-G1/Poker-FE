import { fieldGridClass, titleCase } from '../format'
import DetailField from './DetailField'
import DetailSection from './DetailSection'

export default function ProfileSection({ user }) {
  return <DetailSection title="Profile">
    <dl className={fieldGridClass}>
      <DetailField label="Display name">{user.displayName}</DetailField>
      <DetailField label="Full name">{user.fullName}</DetailField>
      <DetailField label="Phone">{user.phoneNumber}</DetailField>
      <DetailField label="Gender">{titleCase(user.gender)}</DetailField>
      <DetailField label="Birth date">{user.birthDate}</DetailField>
      <DetailField label="Country / city">{[user.countryCode, user.city].filter(Boolean).join(' · ') || null}</DetailField>
      <DetailField label="Avatar">{user.customAvatar ? 'Custom' : 'Default'}</DetailField>
    </dl>
    <dl className="mt-4"><DetailField label="Bio"><span className="whitespace-pre-wrap">{user.bio}</span></DetailField></dl>
  </DetailSection>
}
