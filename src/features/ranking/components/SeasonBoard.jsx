import { Button } from '@/shared/ui'
import BoardState from './BoardState'
import LeaderboardTable from './LeaderboardTable'
import Panel from './Panel'
import styles from './SeasonBoard.module.css'

// Whole-server leaderboard of the active season, one page at a time.
export default function SeasonBoard({ state, page, onPage, onRetry, onFindMatch, profiles, accountId }) {
  const { board } = state
  const refreshing = state.phase === 'refreshing'
  if (state.phase === 'loading') return <BoardState kind="loading" message="Loading the leaderboard…" />
  if (state.phase === 'error') return <BoardState kind="error" message={state.error} actionLabel="Try again" onAction={onRetry} />
  if (state.phase === 'empty') return <BoardState kind="empty" title="No ranked results yet"
    message="The first ranked match of the season will open the leaderboard." actionLabel="Find a ranked match" onAction={onFindMatch} />

  return <Panel aria-label="Season leaderboard" aria-busy={refreshing}>
    <LeaderboardTable players={board.content} profiles={profiles} accountId={accountId} />
    <footer className={styles.pager}>
      <Button disabled={page === 0 || refreshing} onClick={() => onPage(page - 1)}>Previous</Button>
      <span>Page {page + 1} of {Math.max(1, board.totalPages)} · {board.totalElements.toLocaleString()} players</span>
      <Button disabled={page + 1 >= board.totalPages || refreshing} onClick={() => onPage(page + 1)}>Next</Button>
    </footer>
  </Panel>
}
