import { useAuth } from '@/features/auth'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { useQueue } from '@/features/ranked'
import { LobbyBackdrop } from '@/features/demo'
import { CommunityToolbar, PartyPanel } from '@/features/community'
import LoungeModes from './components/LoungeModes'
import ChampionshipBanner from './components/ChampionshipBanner'
import DailyCheckInModal from './components/DailyCheckInModal'
import Leaderboard from './components/Leaderboard'
import PlayerSummary from './components/PlayerSummary'
import { useDailyCheckIn } from './hooks/useDailyCheckIn'

export default function LobbyPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const { open } = useQueue()
  const legacyMode = params.get('match')
  useEffect(() => {
    if (legacyMode === 'RANK' || legacyMode === 'NORMAL') {
      open(legacyMode)
      setParams(previous => { const next = new URLSearchParams(previous); next.delete('match'); return next }, { replace: true })
    }
  }, [legacyMode, open, setParams])
  const [checkInOpen, setCheckInOpen] = useDailyCheckIn()

  return <div className="flex flex-col w-full relative pb-28 px-margin-mobile lg:px-margin">
    <LobbyBackdrop />
    <div className="relative z-10 w-full max-w-7xl mx-auto pt-6 flex flex-col gap-space-lg">
      <CommunityToolbar />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <PlayerSummary player={{ ...user?.profile, email: user?.email }} onOpenCheckIn={() => setCheckInOpen(true)} />
          <LoungeModes />
          <ChampionshipBanner />
        </div>
        <aside className="lg:col-span-4 flex min-w-0 flex-col gap-gutter"><PartyPanel /><Leaderboard /></aside>
      </div>
    </div>
    {checkInOpen && <DailyCheckInModal onClose={() => setCheckInOpen(false)} />}
  </div>
}
