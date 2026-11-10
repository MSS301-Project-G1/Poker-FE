import { useState } from 'react'
import { Button } from '@/shared/ui'
import { useNow } from '../hooks/useNow'
import { PAGE_SIZE, useTournaments } from '../hooks/useTournaments'
import Panel from './Panel'
import SectionState from './SectionState'
import TournamentCard from './TournamentCard'
import styles from './TournamentList.module.css'

const empty = {
  upcoming: { title: 'No tournaments scheduled', message: 'New tournaments appear here as soon as they are announced.' },
  past: { title: 'No past tournaments yet', message: 'Finished and cancelled tournaments stay here with their results.' },
}

// One tab of the list with its own page; the parent keys it by tab, so switching tabs starts at page 1.
export default function TournamentList({ past, devUser }) {
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const state = useTournaments({ past, page, devUser, attempt })
  const now = useNow(60000)
  const { result } = state

  if (state.phase === 'loading') return <Panel><SectionState kind="loading" message="Loading tournaments…" /></Panel>
  if (state.phase === 'error') return <Panel><SectionState kind="error" message={state.error} actionLabel="Try again"
    onAction={() => setAttempt(value => value + 1)} /></Panel>
  if (state.phase === 'empty') return <Panel><SectionState kind="empty" {...empty[past ? 'past' : 'upcoming']} /></Panel>

  return <div className={styles.list} aria-busy={state.phase === 'refreshing'}>
    <ul className={styles.grid}>
      {result.content.map(tournament => <TournamentCard key={tournament.id} tournament={tournament} now={now} />)}
    </ul>
    {result.totalPages > 1 && <footer className={styles.pager}>
      <Button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
      <span>Page {page + 1} of {result.totalPages} · {PAGE_SIZE} per page</span>
      <Button disabled={page + 1 >= result.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
    </footer>}
  </div>
}
