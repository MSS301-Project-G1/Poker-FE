import { useContext, useState } from 'react'
import { RankingRuntimeContext, devIdentity } from './runtime'
import { PAGE_SIZE, useLeaderboard } from './useLeaderboard'
import LeaderboardTable from './components/LeaderboardTable'
import StandingCard from './components/StandingCard'
import './ranking.css'

export default function LeaderboardPage({ navigate }) {
  const runtime = useContext(RankingRuntimeContext)
  const devUser = devIdentity()
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const state = useLeaderboard({ page, devUser, getAccessToken: runtime.getAccessToken, attempt })
  const { season, daysLeft, board, me } = state
  const accountId = me?.accountId || devUser

  return <div className="ranking-page">
    <header className="ranking-header"><a href="/lobby" className="ranking-brand"><span>♠</span> POKER<span>RANK</span></a>
      <nav><button className="ranking-secondary" onClick={() => navigate('/lobby')}>Lobby</button></nav></header>
    <main className="ranking-main">
      <section className="ranking-hero">
        <div><span className="ranking-eyebrow">{season ? `${season.name.toUpperCase()} · ${daysLeft} DAYS LEFT` : 'RANKED SEASON'}</span>
          <h1>Leaderboard</h1>
          <p className="ranking-muted">Players are ranked by Elo. Finish in the top three of a ranked table to climb and extend your streak.</p></div>
        <StandingCard standing={me} signedIn={Boolean(devUser || me)} loading={state.phase === 'loading'} />
      </section>

      {state.phase === 'loading' && <div className="ranking-state" role="status"><div className="ranking-spinner" />Loading the leaderboard…</div>}
      {state.phase === 'error' && <div className="ranking-state" role="alert"><p className="ranking-error">{state.error}</p>
        <button className="ranking-primary" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>}
      {state.phase === 'empty' && <div className="ranking-state"><span className="ranking-state-icon">♠</span><h2>No ranked results yet</h2>
        <p className="ranking-muted">The first ranked match of the season will open the leaderboard.</p>
        <button className="ranking-primary" onClick={() => navigate('/ranked')}>Find a ranked match</button></div>}
      {board && board.totalElements > 0 && state.phase !== 'error' && <section className="ranking-card" aria-label="Season leaderboard" aria-busy={state.phase === 'refreshing'}>
        <LeaderboardTable players={board.content} profiles={runtime.profiles} accountId={accountId} />
        <footer className="ranking-pager">
          <button className="ranking-secondary" disabled={page === 0 || state.phase === 'refreshing'} onClick={() => setPage(value => value - 1)}>Previous</button>
          <span>Page {page + 1} of {Math.max(1, board.totalPages)} · {board.totalElements.toLocaleString()} players</span>
          <button className="ranking-secondary" disabled={page + 1 >= board.totalPages || state.phase === 'refreshing'} onClick={() => setPage(value => value + 1)}>Next</button>
        </footer>
      </section>}
    </main>
    <footer className="ranking-footer"><span>{PAGE_SIZE} PLAYERS PER PAGE</span><span>Card God is awarded to the top 50 Grand Champions.</span></footer>
  </div>
}
