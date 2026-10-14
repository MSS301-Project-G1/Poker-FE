import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { useToast } from '@/shared/ui'
import CasualTablesCard from './components/CasualTablesCard'
import ChampionshipBanner from './components/ChampionshipBanner'
import DailyCheckInModal from './components/DailyCheckInModal'
import Leaderboard from './components/Leaderboard'
import PlayerSummary from './components/PlayerSummary'
import RankedBanner from './components/RankedBanner'
import { useDailyCheckIn } from './hooks/useDailyCheckIn'

export default function LobbyPage() {
  const navigate = useNavigate()
  const notify = useToast()
  const [checkInOpen, setCheckInOpen] = useDailyCheckIn()
  const claimReward = () => {
    setCheckInOpen(false)
    notify('Daily reward claimed in UI demo. Connect a backend to save it.')
  }

  return <div className="flex flex-col w-full relative pb-16 px-margin">
    <div className="w-full max-w-7xl mx-auto pt-6 flex flex-col gap-space-lg">
      <PlayerSummary onOpenCheckIn={() => setCheckInOpen(true)} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <RankedBanner onFindMatch={() => navigate(paths.ranked)} />
          <CasualTablesCard onQuickPlay={() => navigate(paths.table)} />
          <ChampionshipBanner />
        </div>
        <Leaderboard />
      </div>
    </div>
    {checkInOpen && <DailyCheckInModal onClose={() => setCheckInOpen(false)} onClaim={claimReward} />}
  </div>
}
