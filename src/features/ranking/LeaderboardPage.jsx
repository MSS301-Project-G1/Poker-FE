import { useContext, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { paths } from '@/shared/config/paths'
import { devIdentity } from '@/shared/lib/devIdentity'
import { Button, Eyebrow, Icon } from '@/shared/ui'
import BoardTabs from './components/BoardTabs'
import FriendsBoard from './components/FriendsBoard'
import SeasonBoard from './components/SeasonBoard'
import StandingCard from './components/StandingCard'
import { useFriendsLeaderboard } from './hooks/useFriendsLeaderboard'
import { PAGE_SIZE, useLeaderboard } from './hooks/useLeaderboard'
import { RankingRuntimeContext } from './runtime'
import styles from './LeaderboardPage.module.css'

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const runtime = useContext(RankingRuntimeContext)
  const devUser = devIdentity()
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'friends' ? 'friends' : 'season'
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const state = useLeaderboard({ page, devUser, getAccessToken: runtime.getAccessToken, attempt })
  const friends = useFriendsLeaderboard({ enabled: view === 'friends', devUser, getAccessToken: runtime.getAccessToken, attempt })
  const { season, daysLeft, me } = state
  const retry = () => setAttempt(value => value + 1)
  // The tab lives in the URL so a shared link opens the same view; other params such as devUser stay.
  const show = next => setParams(current => {
    const updated = new URLSearchParams(current)
    if (next === 'friends') updated.set('view', 'friends')
    else updated.delete('view')
    return updated
  }, { replace: true })

  return <div className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.intro}>
        <Eyebrow>{season ? `${season.name.toUpperCase()} · ${daysLeft} DAYS LEFT` : 'RANKED SEASON'}</Eyebrow>
        <h1 className={styles.title}>Leaderboard</h1>
        <p className={styles.muted}>Players are ranked by Elo. Finish in the top three of a ranked table to climb and extend your streak.</p>
        <Button className={styles.rewards} onClick={() => navigate(paths.seasons)}><Icon name="card_giftcard" />Season rewards</Button>
      </div>
      <StandingCard standing={me} signedIn={Boolean(devUser || me)} loading={state.phase === 'loading'} />
    </section>

    <BoardTabs view={view} onChange={show} />
    <div id="board-panel" role="tabpanel" aria-labelledby={`board-tab-${view}`}>
      {view === 'season'
        ? <SeasonBoard state={state} page={page} onPage={setPage} onRetry={retry} onFindMatch={() => navigate(paths.ranked)}
          profiles={runtime.profiles} accountId={me?.accountId || devUser} />
        : <FriendsBoard state={friends} profiles={runtime.profiles} onRetry={retry} />}
    </div>

    <p className={styles.footnote}>{PAGE_SIZE} players per page · Card God is awarded to the top 50 Grand Champions.</p>
  </div>
}
