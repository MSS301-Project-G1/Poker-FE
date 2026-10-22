import { useNavigate } from 'react-router'
import { useAuth } from '@/features/auth'
import { paths } from '@/shared/config/paths'
import CasualTablesCard from './components/CasualTablesCard'
import ChampionshipBanner from './components/ChampionshipBanner'
import DailyCheckInModal from './components/DailyCheckInModal'
import Leaderboard from './components/Leaderboard'
import PlayerSummary from './components/PlayerSummary'
import RankedBanner from './components/RankedBanner'
import { useDailyCheckIn } from './hooks/useDailyCheckIn'

export default function LobbyPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [checkInOpen, setCheckInOpen] = useDailyCheckIn()

  return <div className="flex flex-col w-full relative pb-16 px-margin">
    <div className="w-full max-w-7xl mx-auto pt-6 flex flex-col gap-space-lg">
      <PlayerSummary player={{ ...user?.profile, email: user?.email }} onOpenCheckIn={() => setCheckInOpen(true)} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <RankedBanner onFindMatch={() => navigate(paths.ranked)} />
          <CasualTablesCard onQuickPlay={() => navigate(`${paths.ranked}?mode=NORMAL`)} />
          <ChampionshipBanner />
        </div>
        <Leaderboard />
      </div>
    </div>
    {checkInOpen && <DailyCheckInModal onClose={() => setCheckInOpen(false)} />}
  </div>
}
