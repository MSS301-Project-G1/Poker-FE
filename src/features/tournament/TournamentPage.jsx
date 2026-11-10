import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '@/features/auth'
import { paths } from '@/shared/config/paths'
import { Button, Eyebrow, useConfirm, useToast } from '@/shared/ui'
import { confirmTournament, registerTournament } from './api/tournamentApi'
import Bracket from './components/Bracket'
import EntryPanel from './components/EntryPanel'
import Panel from './components/Panel'
import PlayerList from './components/PlayerList'
import PrizePanel from './components/PrizePanel'
import SectionState from './components/SectionState'
import TournamentHeading from './components/TournamentHeading'
import { formatCoins } from './format'
import { useDevUser } from './hooks/useDevUser'
import { useNow } from './hooks/useNow'
import { useProfiles } from './hooks/useProfiles'
import { useTournament } from './hooks/useTournament'
import styles from './TournamentPage.module.css'

// Local identities carry over so the game table acts as the same player.
const tableLink = (tableId, devUser) => `${paths.tableById(tableId)}${devUser ? `?devUser=${devUser}` : ''}`

export default function TournamentPage() {
  const { tournamentId } = useParams()
  const [attempt, setAttempt] = useState(0)
  return <TournamentView key={`${tournamentId}:${attempt}`} id={tournamentId} retry={() => setAttempt(value => value + 1)} />
}

function TournamentView({ id, retry }) {
  const navigate = useNavigate()
  const notify = useToast()
  const confirm = useConfirm()
  const { user } = useAuth()
  const devUser = useDevUser()
  const now = useNow(15000)
  const session = useTournament({ id, devUser })
  const { tournament } = session
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const previousTable = useRef(undefined)

  const accountId = devUser || user?.accountId
  const entries = tournament?.entries || []
  const profiles = useProfiles(entries.map(entry => entry.accountId))
  const me = entries.find(entry => entry.accountId === accountId)
  const myTableId = tournament?.tables.find(table => table.status === 'PLAYING' && table.tableId
    && table.seats.some(seat => seat.accountId === accountId))?.tableId || null

  // Follow the player's table when it opens while they wait here.
  useEffect(() => {
    if (!tournament) return
    if (previousTable.current === null && myTableId) navigate(tableLink(myTableId, devUser))
    previousTable.current = myTableId
  }, [tournament, myTableId, navigate, devUser])

  const act = async (action, done) => {
    setBusy(true)
    setActionError('')
    try {
      session.apply(await action(id, { devUser }))
      notify(done)
    } catch (failure) {
      setActionError(failure.message)
    } finally { setBusy(false) }
  }
  const register = async () => {
    const fee = tournament.entryFee
    if (fee > 0 && !await confirm({
      title: 'Register for this tournament?', icon: 'emoji_events', confirmLabel: 'Pay and register', cancelLabel: 'Not now',
      message: `${formatCoins(fee)} will be taken from your wallet now. The fee is refunded if the tournament is cancelled.`,
    })) return
    await act(registerTournament, 'You are registered. Your table opens when the tournament starts.')
  }
  const accept = () => act(confirmTournament, 'Invitation accepted. Your table opens when the tournament starts.')

  if (session.phase === 'loading') return <div className={styles.page}><Panel><SectionState kind="loading" message="Loading the tournament…" /></Panel></div>
  if (session.phase === 'error') return <div className={styles.page}><Panel>
    <SectionState kind="error" message={session.error} actionLabel="Try again" onAction={retry} /></Panel></div>
  if (session.phase === 'missing') return <div className={styles.page}><Panel>
    <SectionState kind="empty" title="Tournament not found" message={session.error} actionLabel="All tournaments"
      onAction={() => navigate(paths.tournaments)} /></Panel></div>

  const taken = entries.filter(entry => entry.status !== 'EXPIRED').length
  return <div className={styles.page}>
    <div className={styles.top}>
      <TournamentHeading tournament={tournament} now={now} connectionError={session.error} />
      <Button onClick={() => navigate(paths.tournaments)}>All tournaments</Button>
    </div>
    <div className={styles.grid}>
      <div className={styles.main}>
        <Panel aria-labelledby="bracket-title">
          <header><Eyebrow>BRACKET</Eyebrow><h2 id="bracket-title" className={styles.sectionTitle}>Tables</h2></header>
          <Bracket tournament={tournament} profiles={profiles} accountId={accountId}
            onOpenTable={tableId => navigate(tableLink(tableId, devUser))} />
        </Panel>
        <Panel aria-labelledby="players-title">
          <header><Eyebrow>FIELD</Eyebrow><h2 id="players-title" className={styles.sectionTitle}>Players · {taken} / {tournament.slots}</h2></header>
          {entries.length > 0 ? <PlayerList entries={entries} profiles={profiles} accountId={accountId} />
            : <p className={styles.muted}>{tournament.type === 'ELITE' ? 'Invitations have not been sent yet.' : 'No one has registered yet.'}</p>}
        </Panel>
      </div>
      <div className={styles.side}>
        <EntryPanel tournament={tournament} me={me} myTableId={myTableId} now={now} busy={busy} error={actionError}
          onRegister={register} onConfirm={accept} onOpenTable={() => navigate(tableLink(myTableId, devUser))}
          onLeaderboard={() => navigate(paths.ranking)} />
        <PrizePanel tournament={tournament} />
      </div>
    </div>
  </div>
}
