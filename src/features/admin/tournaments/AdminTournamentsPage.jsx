import { useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { devIdentity } from '@/shared/lib/devIdentity'
import { Button, Eyebrow, Icon, useConfirm, useToast } from '@/shared/ui'
import { cancelTournament, createTournament, startTournament } from './api/adminTournamentApi'
import Message from './components/Message'
import Panel from './components/Panel'
import TournamentAdminList from './components/TournamentAdminList'
import TournamentForm from './components/TournamentForm'
import ViewTabs from './components/ViewTabs'
import { useProducts } from './hooks/useProducts'
import styles from './AdminTournamentsPage.module.css'

export default function AdminTournamentsPage() {
  const navigate = useNavigate()
  const notify = useToast()
  const confirm = useConfirm()
  const devUser = devIdentity()
  const products = useProducts(devUser)
  const [view, setView] = useState('upcoming')
  const [attempt, setAttempt] = useState(0)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')

  const create = async tournament => {
    const created = await createTournament(tournament, { devUser })
    notify(`${created.name} is scheduled.`)
    setView('upcoming')
    setAttempt(value => value + 1)
  }
  const act = async (tournament, question, action, done) => {
    if (!await confirm(question)) return
    setBusyId(tournament.id)
    setActionError('')
    try {
      await action(tournament.id, { devUser })
      notify(done)
      setAttempt(value => value + 1)
    } catch (failure) {
      setActionError(failure.message)
    } finally { setBusyId(null) }
  }
  const start = tournament => act(tournament, {
    title: `Start ${tournament.name} now?`, icon: 'play_arrow', confirmLabel: 'Start now', cancelLabel: 'Not yet',
    message: 'Players holding a place are seated and the tables open at once; unconfirmed invitations expire. At least 4 players are needed.',
  }, startTournament, `${tournament.name} started.`)
  const cancel = tournament => act(tournament, {
    title: `Cancel ${tournament.name}?`, icon: 'event_busy', danger: true, confirmLabel: 'Cancel tournament', cancelLabel: 'Keep it',
    message: 'Every entry fee is refunded to the players. This cannot be undone.',
  }, cancelTournament, `${tournament.name} cancelled. Entry fees are being refunded.`)

  return <div className={styles.page}>
    <header className={styles.header}>
      <div className={styles.intro}>
        <Eyebrow>COMPETITION ADMINISTRATION</Eyebrow>
        <h1 className={styles.title}>Tournaments</h1>
        <p className={styles.muted}>Schedule Elite and Open tournaments. At the start time the players holding a place are seated
          automatically; with fewer than 4 players the tournament is cancelled and entry fees are refunded.</p>
      </div>
      <Button onClick={() => navigate(paths.adminSeasons)}><Icon name="calendar_month" />Seasons</Button>
    </header>

    <div className={styles.grid}>
      <Panel aria-labelledby="form-title">
        <h2 id="form-title" className={styles.sectionTitle}>New tournament</h2>
        <TournamentForm products={products} onCreate={create} />
      </Panel>
      <Panel aria-labelledby="list-title">
        <header className={styles.listHeader}>
          <h2 id="list-title" className={styles.sectionTitle}>Schedule</h2>
          <ViewTabs view={view} onChange={setView} />
        </header>
        {actionError && <Message tone="error">{actionError}</Message>}
        <div id="admin-tournament-panel" role="tabpanel" aria-labelledby={`admin-tournament-tab-${view}`}>
          <TournamentAdminList key={view} past={view === 'past'} devUser={devUser} attempt={attempt} busyId={busyId}
            onStart={start} onCancel={cancel} />
        </div>
      </Panel>
    </div>
  </div>
}
