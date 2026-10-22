import BoardState from './BoardState'
import LeaderboardTable from './LeaderboardTable'
import Panel from './Panel'
import styles from './FriendsBoard.module.css'

// The player and their friends ranked together; "Server rank" is the season leaderboard position.
export default function FriendsBoard({ state, profiles, onRetry }) {
  if (state.phase === 'loading') return <BoardState kind="loading" message="Loading your friends…" />
  if (state.phase === 'signed-out') return <BoardState kind="empty" title="Sign in to compare with friends"
    message="Your friends and their season standing appear here once you are signed in." />
  if (state.phase === 'error') return <BoardState kind="error" message={state.error} actionLabel="Try again" onAction={onRetry} />

  const alone = state.rows.length <= 1
  return <Panel aria-label="Friends leaderboard" aria-busy={state.phase === 'refreshing'}>
    <LeaderboardTable players={state.rows} profiles={profiles} friends />
    <p className={styles.note}>{alone
      ? 'No friends to compare with yet. Friends you add appear here with their season standing.'
      : 'Friends without a ranked match this season are listed last as unranked.'}</p>
  </Panel>
}
