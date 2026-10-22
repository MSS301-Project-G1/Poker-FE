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

  // One flat grid so every block lines up with its row neighbours. From xl the leaderboard takes the
  // right column across all rows and the party panel sits beside the two mode cards.
  return <div className="flex flex-col w-full relative py-space-md px-margin-mobile lg:px-margin">
    <LobbyBackdrop />
    <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-space-md">
      <CommunityToolbar />
      <div className="grid grid-cols-12 gap-space-md">
        <div className="col-span-12 xl:col-span-9 grid">
          <PlayerSummary player={{ ...user?.profile, email: user?.email }} onOpenCheckIn={() => setCheckInOpen(true)} />
        </div>
        <div className="col-span-12 lg:col-span-8 xl:col-span-6 grid"><LoungeModes /></div>
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 grid min-w-0"><PartyPanel /></div>
        <div className="col-span-12 xl:col-span-9 grid"><ChampionshipBanner /></div>
        <aside className="col-span-12 xl:col-span-3 xl:col-start-10 xl:row-start-1 xl:row-span-3 grid min-w-0"><Leaderboard /></aside>
      </div>
    </div>
    {checkInOpen && <DailyCheckInModal onClose={() => setCheckInOpen(false)} />}
  </div>
}
