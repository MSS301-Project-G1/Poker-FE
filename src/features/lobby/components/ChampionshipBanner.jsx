import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'
import GameModeBanner from './GameModeBanner'

const typeLabels = { OPEN: 'OPEN EVENT', ELITE: 'ELITE EVENT' }
const liveLabels = { QUALIFYING: 'Qualifiers live', FINAL: 'Final live' }
const coins = amount => `${amount.toLocaleString()} COINS`

// "01:42:18" under a day, "3 days" beyond; null once the start has passed.
function countdown(startAt, now) {
  const seconds = Math.floor((Date.parse(startAt) - now) / 1000)
  if (seconds <= 0) return null
  if (seconds >= 86400) return `${Math.floor(seconds / 86400)} ${seconds >= 172800 ? 'days' : 'day'}`
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

  return <GameModeBanner image="/stitch-assets/lobby-championship-en.png" veil="via-surface-container-lowest/80 to-surface-container-lowest/30">
    <div className="relative h-full px-space-lg py-space-md flex flex-col md:flex-row justify-between items-start md:items-center gap-space-md">
      {tournament ? <div className="flex flex-col gap-space-xs min-w-0">
        <div className="flex flex-wrap items-center gap-space-xs">
          <span className="px-2 py-0.5 rounded-full bg-tertiary-container/60 text-tertiary text-label-micro font-label-micro font-bold uppercase">{typeLabels[tournament.type] || 'TOURNAMENT'}</span>
          <span className="text-primary text-label-micro font-label-micro">
            {tournament.type === 'ELITE' ? 'Invitation only · Top of the leaderboard' : `${tournament.entryCount} / ${tournament.slots} players registered`}
          </span>
          {left && <span className="flex items-center gap-space-xs bg-surface-container-lowest/80 backdrop-blur-md px-space-sm py-0.5 rounded-lg">
            <Icon name="timer" className="text-error text-sm animate-pulse" />
            <span className="text-on-surface font-label-numeric-md text-label-numeric-md tracking-wider">{left}</span>
            <span className="text-on-surface-variant text-label-micro font-label-micro">until it starts</span>
          </span>}
          {liveLabels[tournament.status] && <span className="flex items-center gap-space-xs bg-surface-container-lowest/80 backdrop-blur-md px-space-sm py-0.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <span className="text-on-surface text-label-micro font-label-micro">{liveLabels[tournament.status]}</span>
          </span>}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-space-md gap-y-space-xs">
          <h2 className="font-headline-md text-headline-md text-tertiary drop-shadow-md break-words">{tournament.name}</h2>
          <span className="text-on-surface-variant font-body-sm text-body-sm">
            {tournament.prizePool > 0 ? <>Total Prize Pool: <strong className="font-label-numeric-md text-label-numeric-md text-tertiary">{coins(tournament.prizePool)}</strong></>
              : <>Entry: <strong className="font-label-numeric-md text-label-numeric-md text-tertiary">{tournament.entryFee > 0 ? coins(tournament.entryFee) : 'FREE'}</strong></>}
          </span>
        </div>
      </div> : <div className="flex flex-col gap-space-xs min-w-0">
        <span className="self-start px-2 py-0.5 rounded-full bg-tertiary-container/60 text-tertiary text-label-micro font-label-micro font-bold uppercase">TOURNAMENTS</span>
        <h2 className="font-headline-md text-headline-md text-tertiary drop-shadow-md">CHAMPIONSHIP TOURNAMENTS</h2>
        <p className="text-on-surface-variant font-body-sm text-body-sm" role={phase === 'loading' ? 'status' : undefined}>
          {phase === 'loading' ? 'Loading the next tournament…'
            : phase === 'error' ? 'The tournament schedule is unavailable right now.' : 'No tournament is scheduled yet. See past results and winners.'}
        </p>
      </div>}
      <Link to={tournament ? paths.tournamentById(tournament.id) : paths.tournaments} className="w-full md:w-auto shrink-0 px-space-lg py-space-sm bg-gradient-to-r from-tertiary-container to-tertiary text-on-tertiary font-label-action text-label-action rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-space-xs">
        <Icon name="emoji_events" />
        <span>{!tournament ? 'ALL TOURNAMENTS' : scheduled && tournament.type === 'OPEN' ? 'VIEW & REGISTER' : 'VIEW TOURNAMENT'}</span>
      </Link>
    </div>
  </GameModeBanner>
}
