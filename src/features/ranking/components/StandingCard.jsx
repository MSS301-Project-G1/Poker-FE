import TierBadge from './TierBadge'

export default function StandingCard({ standing, signedIn, loading }) {
  if (!standing) return <section className="ranking-card ranking-standing" aria-label="Your standing">
    <span className="ranking-eyebrow">YOUR STANDING</span>
    <p className="ranking-muted">{loading || signedIn ? 'Loading your standing…' : 'Sign in to see your position this season.'}</p>
  </section>
  const stats = [['Elo', standing.elo], ['Peak', standing.peakElo], ['Win streak', standing.winStreak], ['Matches', standing.matchesPlayed]]
  return <section className="ranking-card ranking-standing" aria-label="Your standing">
    <span className="ranking-eyebrow">YOUR STANDING</span>
    <div className="ranking-standing-main">
      <strong className="ranking-position">{standing.position ? `#${standing.position.toLocaleString()}` : 'Unranked'}</strong>
      <TierBadge tier={standing.tier} />
    </div>
    {!standing.position && <p className="ranking-muted">Play a ranked match to join the leaderboard.</p>}
    <dl className="ranking-stats">{stats.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value.toLocaleString()}</dd></div>)}</dl>
  </section>
}
