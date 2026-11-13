import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '@/features/auth'
import { paths } from '@/shared/config/paths'
import { AvatarFrame } from '@/shared/skin'
import { Button, Caption, Icon, useToast } from '@/shared/ui'
import AccountSection from './components/AccountSection'
import BanUserDialog from './components/BanUserDialog'
import EloAdjustmentHistory from './components/EloAdjustmentHistory'
import EloDialog from './components/EloDialog'
import GameSection from './components/GameSection'
import ModerationDialog from './components/ModerationDialog'
import ModerationHistory from './components/ModerationHistory'
import ModerationPanel from './components/ModerationPanel'
import ProfileSection from './components/ProfileSection'
import UserBanDetails from './components/UserBanDetails'
import { useAdminUserDetail } from './hooks/useAdminUserDetail'
import { errorMessage } from './format'

export default function AdminUserDetailPage() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const notify = useToast()
  const { user: admin } = useAuth()
  const [attempt, setAttempt] = useState(0)
  const [dialog, setDialog] = useState(null)
  const state = useAdminUserDetail(accountId, attempt)
  const reload = () => setAttempt(value => value + 1)
  const done = message => { setDialog(null); reload(); notify(message) }
  const user = state.user
  // Same rule as auth and ranking: no action on oneself or on another ADMIN.
  const editable = Boolean(user) && user.role !== 'ADMIN' && user.accountId !== admin.accountId

  return <div className="w-full px-margin pb-space-lg pt-space-md">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-space-md">
      <header className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex min-w-0 items-center gap-4">
          {user && <AvatarFrame avatarUrl={user.avatarUrl} name={user.displayName || user.email} size="lg" />}
          <div className="min-w-0"><h1 className="break-words font-headline-lg text-headline-lg">{user?.displayName || 'User details'}</h1>
            {user && <Caption className="break-all">{user.email} · {user.playerCode || user.accountId}</Caption>}</div>
        </div>
        <div className="flex gap-3"><Button onClick={reload} disabled={state.loading}><Icon name="refresh" />Reload</Button><Button onClick={() => navigate(paths.adminUsers)}>Back to users</Button></div>
      </header>

      {state.loading ? <p role="status">Loading user…</p> : state.error ? <div role="alert" className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-space-lg">
        <p>{errorMessage(state.error)}</p><Button className="mt-3" onClick={reload}>Try again</Button></div> : <>
        <AccountSection user={user} adminId={admin.accountId} />
        <ProfileSection user={user} />
        <GameSection user={user} standing={state.standing} matches={state.matches} editable={editable} onAdjustElo={() => setDialog({ type: 'elo' })} />
        <ModerationPanel user={user} editable={editable} onBan={() => setDialog({ type: 'ban' })} onModerate={item => setDialog({ type: 'moderate', item })} />
        <ModerationHistory accountId={accountId} attempt={attempt} />
        <EloAdjustmentHistory accountId={accountId} attempt={attempt} />
        <UserBanDetails key={accountId} accountId={accountId} attempt={attempt} />
      </>}

      {dialog?.type === 'ban' && <BanUserDialog key={user.accountId} user={user} onClose={() => setDialog(null)} onReload={() => { setDialog(null); reload() }}
        onSaved={result => done(result.banned ? 'Account banned and active sessions revoked.' : 'Unbanned. The user can sign in again.')} />}
      {dialog?.type === 'moderate' && <ModerationDialog key={dialog.item.action} user={user} item={dialog.item} onClose={() => setDialog(null)}
        onSaved={() => done(`${dialog.item.label}: done.`)} />}
      {dialog?.type === 'elo' && <EloDialog user={user} standing={state.standing.data} onClose={() => setDialog(null)}
        onSaved={result => done(`Elo set to ${result.elo}.`)} />}
    </div>
  </div>
}
