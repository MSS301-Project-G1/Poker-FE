import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import MatchRadar from './components/MatchRadar'
import PerformanceCard from './components/PerformanceCard'
import QueueActions from './components/QueueActions'
import QueueHeader from './components/QueueHeader'
import TableGathering from './components/TableGathering'

// Blurred skeleton of the lobby behind the matchmaking panel.
function LobbyBackdrop() {
  return <div className="absolute inset-0 pointer-events-none opacity-35 filter blur-md select-none">
    <div className="w-full h-full p-margin grid grid-cols-12 gap-gutter">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-space-md">
        <div className="h-44 rounded-xl bg-surface-container-high relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-secondary-container/40 to-transparent"></div>
        </div>
        <div className="grid grid-cols-3 gap-space-md">
          <div className="h-32 rounded-lg bg-surface-container-low"></div>
          <div className="h-32 rounded-lg bg-surface-container-low"></div>
          <div className="h-32 rounded-lg bg-surface-container-low"></div>
        </div>
      </div>
      <div className="hidden lg:flex col-span-4 flex-col gap-space-md">
        <div className="h-80 rounded-xl bg-surface-container-low"></div>
        <div className="h-40 rounded-xl bg-surface-container-low"></div>
      </div>
    </div>
  </div>
}

export default function RankedPage() {
  const navigate = useNavigate()

  return <div className="flex flex-col w-full">
    <div className="relative w-full min-h-[calc(100vh-7.5rem)] flex items-center justify-center p-space-sm sm:p-space-lg overflow-hidden">
      <LobbyBackdrop />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-primary-container/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-28 right-1/4 w-[480px] h-[480px] bg-secondary-container/25 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl bg-surface-container-lowest/95 backdrop-blur-2xl rounded-xl shadow-[0_24px_80px_rgb(var(--color-obsidian)/0.95)] overflow-hidden flex flex-col">
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-85"></div>
        <QueueHeader />
        <div className="px-space-md sm:px-space-xl py-space-md grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
          <MatchRadar />
          <PerformanceCard />
        </div>
        <TableGathering />
        <QueueActions onCancel={() => navigate(paths.lobby)} onReady={() => navigate(paths.table)} />
      </div>
    </div>
  </div>
}
