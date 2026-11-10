import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'

const typeLabels = { OPEN: 'Open', ELITE: 'Masters' }
const liveLabels = { QUALIFYING: 'Qualifiers in progress', FINAL: 'Final in progress' }
const coins = amount => `${amount.toLocaleString()} coins`

// "01:42:18" under a day, "3 ngày" beyond; null once the start has passed.
function countdown(startAt, now) {
  const seconds = Math.floor((Date.parse(startAt) - now) / 1000)
  if (seconds <= 0) return null
  if (seconds >= 86400) return `${Math.floor(seconds / 86400)}d`
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(part => String(part).padStart(2, '0')).join(':')
}

/** featured: useNextTournament() from the tournament feature. */
export default function ChampionshipBanner({ featured }) {
  const { phase, tournament } = featured
  const scheduled = tournament?.status === 'SCHEDULED'
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!scheduled) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [scheduled])
  const left = scheduled ? countdown(tournament.startAt, now) : null

  const details = tournament ? [
    typeLabels[tournament.type] || 'Tournaments',
    tournament.type === 'ELITE' ? 'Invitation only · leaderboard top' : `${tournament.entryCount}/${tournament.slots} registered`,
    tournament.prizePool > 0 ? `Prize pool ${coins(tournament.prizePool)}`
      : `Entry ${tournament.entryFee > 0 ? coins(tournament.entryFee) : 'free'}`,
  ] : null

  return <div className="rounded-2xl border border-tertiary/35 bg-surface-container-lowest/85 backdrop-blur-md shadow-raised px-space-lg py-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
    <div className="flex items-center gap-space-md min-w-0">
      <span className="hidden sm:grid place-items-center w-11 h-11 shrink-0 rounded-xl bg-tertiary/15 text-tertiary" aria-hidden="true"><Icon name="emoji_events" filled /></span>
      {tournament ? <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-space-sm gap-y-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-on-surface break-words">{tournament.name}</h2>
          {left && <span className="font-label-numeric-md text-label-numeric-md text-tertiary tabular-nums">{left} left</span>}
          {liveLabels[tournament.status] && <span className="inline-flex items-center gap-space-xs text-body-sm font-body-sm text-error">
            <span className="w-2 h-2 rounded-full bg-error" aria-hidden="true" />{liveLabels[tournament.status]}
          </span>}
        </div>
        <p className="text-on-surface-variant font-body-sm text-body-sm">{details.join(' · ')}</p>
      </div> : <div className="min-w-0">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Tournaments</h2>
        <p className="text-on-surface-variant font-body-sm text-body-sm" role={phase === 'loading' ? 'status' : undefined}>
          {phase === 'loading' ? 'Loading the next tournament…'
            : phase === 'error' ? 'Couldn’t load the tournament schedule.' : 'No tournaments scheduled. See past results.'}
        </p>
      </div>}
    </div>
    <Link to={tournament ? paths.tournamentById(tournament.id) : paths.tournaments} className="w-full md:w-auto shrink-0 px-space-lg py-space-sm rounded-lg bg-tertiary text-on-tertiary font-label-action text-label-action hover:bg-tertiary-fixed transition-colors flex items-center justify-center">
      {!tournament ? 'All tournaments' : scheduled && tournament.type === 'OPEN' ? 'View and register' : 'View tournament'}
    </Link>
  </div>
}
