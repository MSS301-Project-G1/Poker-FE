import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/features/auth'
import { paths } from '@/shared/config/paths'
import { Button, Icon, useToast } from '@/shared/ui'
import { fetchMyProfile, updateMyProfile } from './api/profileApi'
import AvatarSettings from './components/AvatarSettings'
import ChangePasswordForm from './components/ChangePasswordForm'
import ProfileForm from './components/ProfileForm'

const messageOf = error => error?.requestId ? `${error.message} Reference: ${error.requestId}` : error?.message

export default function AccountPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const notify = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async signal => {
    setLoading(true); setError('')
    try { setProfile(await fetchMyProfile(signal)) } catch (failure) {
      if (failure.name !== 'AbortError') setError(messageOf(failure) || 'Unable to load your profile.')
    } finally { if (!signal?.aborted) setLoading(false) }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchMyProfile(controller.signal)
      .then(setProfile)
      .catch(failure => { if (failure.name !== 'AbortError') setError(messageOf(failure) || 'Unable to load your profile.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  const saveProfile = async values => {
    setSaving(true); setError('')
    try {
      const updated = await updateMyProfile(values)
      setProfile(updated)
      await auth.refreshUser()
      notify('Profile updated.')
    } catch (failure) { setError(messageOf(failure) || 'Unable to update your profile.') } finally { setSaving(false) }
  }

  const avatarChanged = async message => {
    const [updated] = await Promise.all([fetchMyProfile(), auth.refreshUser()])
    setProfile(updated)
    notify(message)
  }

  const passwordChanged = () => {
    auth.endSession()
    notify('Password changed. Sign in again with your new password.')
    navigate(paths.auth, { replace: true })
  }

  return <div className="w-full px-margin pb-20 pt-space-lg">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-space-lg">
      <header className="flex flex-wrap items-center justify-between gap-space-md">
        <div><p className="font-label-action text-label-action uppercase tracking-widest text-primary">Account center</p><h1 className="font-headline-xl text-headline-xl">Profile & security</h1></div>
        <Button onClick={() => navigate(paths.lobby)}><Icon name="arrow_back" />Back to lobby</Button>
      </header>
      {error && <div className="rounded-xl border border-error/35 bg-error-container/20 p-3 text-sm text-on-error-container" role="alert">{error}</div>}
      {loading && <div className="rounded-2xl bg-surface-container-low p-space-xl text-center text-on-surface-variant" role="status">Loading your profile…</div>}
      {!loading && !profile && <div className="rounded-2xl bg-surface-container-low p-space-xl text-center"><p>Profile information is unavailable.</p><Button className="mt-space-md" onClick={() => load()}>Try again</Button></div>}
      {profile && <>
        <ProfileForm key={JSON.stringify(profile)} profile={profile} pending={saving} onSave={saveProfile} />
        <AvatarSettings currentAvatarUrl={profile.avatarUrl} displayName={profile.displayName} onChanged={avatarChanged} />
        <ChangePasswordForm onChanged={passwordChanged} />
      </>}
    </div>
  </div>
}
