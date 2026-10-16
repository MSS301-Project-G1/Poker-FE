import { useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { devIdentity } from '@/shared/lib/devIdentity'
import { Button, Eyebrow, Icon } from '@/shared/ui'
import LeaderboardTable from './components/LeaderboardTable'
import Panel from './components/Panel'
import StandingCard from './components/StandingCard'
import { PAGE_SIZE, useLeaderboard } from './hooks/useLeaderboard'
import { RankingRuntimeContext } from './runtime'
import styles from './LeaderboardPage.module.css'

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const runtime = useContext(RankingRuntimeContext)
  const devUser = devIdentity()
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const state = useLeaderboard({ page, devUser, getAccessToken: runtime.getAccessToken, attempt })
  const { season, daysLeft, board, me } = state
  const accountId = me?.accountId || devUser
  const refreshing = state.phase === 'refreshing'

  return <div className={styles.page}>
    <section className={styles.hero}>
      <div>
        <Eyebrow>{season ? `${season.name.toUpperCase()} · ${daysLeft} DAYS LEFT` : 'RANKED SEASON'}</Eyebrow>
        <h1 className={styles.title}>Leaderboard</h1>
        <p className={styles.muted}>Players are ranked by Elo. Finish in the top three of a ranked table to climb and extend your streak.</p>
      </div>
      <StandingCard standing={me} signedIn={Boolean(devUser || me)} loading={state.phase === 'loading'} />
    </section>

    {state.phase === 'loading' && <Panel className={styles.state} role="status"><div className={styles.spinner} />Loading the leaderboard…</Panel>}
    {state.phase === 'error' && <Panel className={styles.state} role="alert">
      <p className={styles.error}>{state.error}</p>
      <Button variant="primary" onClick={() => setAttempt(value => value + 1)}>Try again</Button>
    </Panel>}
    {state.phase === 'empty' && <Panel className={styles.state}>
      <Icon name="playing_cards" className={styles.stateIcon} />
      <h2 className={styles.stateTitle}>No ranked results yet</h2>
      <p className={styles.muted}>The first ranked match of the season will open the leaderboard.</p>
      <Button variant="primary" onClick={() => navigate(paths.ranked)}>Find a ranked match</Button>
    </Panel>}
    {board?.totalElements > 0 && state.phase !== 'error' && <Panel aria-label="Season leaderboard" aria-busy={refreshing}>
      <LeaderboardTable players={board.content} profiles={runtime.profiles} accountId={accountId} />
      <footer className={styles.pager}>
        <Button disabled={page === 0 || refreshing} onClick={() => setPage(value => value - 1)}>Previous</Button>
        <span>Page {page + 1} of {Math.max(1, board.totalPages)} · {board.totalElements.toLocaleString()} players</span>
        <Button disabled={page + 1 >= board.totalPages || refreshing} onClick={() => setPage(value => value + 1)}>Next</Button>
      </footer>
    </Panel>}

    <p className={styles.footnote}>{PAGE_SIZE} players per page · Card God is awarded to the top 50 Grand Champions.</p>
  </div>
}
