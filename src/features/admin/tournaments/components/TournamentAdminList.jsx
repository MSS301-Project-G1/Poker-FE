import { useState } from 'react'
import { Button } from '@/shared/ui'
import { PAGE_SIZE, useAdminTournaments } from '../hooks/useAdminTournaments'
import SectionState from './SectionState'
import TournamentRows from './TournamentRows'
import styles from './TournamentAdminList.module.css'

// One tab with its own page; the parent keys it by tab and raises attempt after every change.
export default function TournamentAdminList({ past, devUser, attempt, busyId, onStart, onCancel }) {
  const [page, setPage] = useState(0)
  const [retry, setRetry] = useState(0)
  const state = useAdminTournaments({ past, page, devUser, attempt: attempt + retry })
  const { result } = state

  if (state.phase === 'loading') return <SectionState kind="loading" message="Loading tournaments…" />
  if (state.phase === 'error') return <SectionState kind="error" message={state.error} actionLabel="Try again" onAction={() => setRetry(value => value + 1)} />
  if (state.phase === 'empty') return <SectionState kind="empty" title={past ? 'No ended tournaments' : 'Nothing scheduled'}
    message={past ? 'Finished and cancelled tournaments appear here.' : 'Schedule a tournament with the form.'} />

  return <div className={styles.list} aria-busy={state.phase === 'refreshing'}>
    <TournamentRows tournaments={result.content} busyId={busyId} onStart={onStart} onCancel={onCancel} />
    {result.totalPages > 1 && <footer className={styles.pager}>
      <Button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
      <span>Page {page + 1} of {result.totalPages} · {PAGE_SIZE} per page</span>
      <Button disabled={page + 1 >= result.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
    </footer>}
  </div>
}
