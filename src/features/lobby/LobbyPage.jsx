import { useAuth } from '@/features/auth'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useQueue } from '@/features/ranked'
import { LobbyBackdrop } from '@/features/demo'
import { CommunityToolbar, PartyPanel } from '@/features/community'
import { Icon } from '@/shared/ui'
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
  const [zenMode, setZenMode] = useState(false)
  const [leaderboardCollapsed, setLeaderboardCollapsed] = useState(false)

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape' && zenMode) setZenMode(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zenMode])

  return <div className="flex flex-col w-full relative py-space-md px-margin-mobile lg:px-margin min-h-[calc(100vh-5rem)]">
    <LobbyBackdrop />

    {/* Floating Exit Button when in Full 3D Zen Mode */}
    {zenMode && (
      <div className="fixed top-24 right-6 z-50 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setZenMode(false)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-xl border border-primary/50 text-white font-label-action text-sm shadow-2xl hover:bg-primary-container hover:border-primary active:scale-95 transition-all duration-300 group cursor-pointer"
        >
          <Icon name="visibility" className="text-tertiary group-hover:scale-110 transition-transform" />
          <span>Hiện lại giao diện sảnh</span>
          <span className="text-[10px] text-on-surface-variant font-mono bg-white/10 px-1.5 py-0.5 rounded ml-1">ESC</span>
        </button>
      </div>
    )}

    {/* Main Lobby HUD overlay */}
    <div className={`relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-space-md transition-all duration-500 ${zenMode ? 'opacity-0 pointer-events-none scale-95 translate-y-4' : 'opacity-100 scale-100'}`}>
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex-1 min-w-[280px]">
          <CommunityToolbar />
        </div>
        <button
          type="button"
          onClick={() => setZenMode(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest/40 hover:bg-primary-container/40 border border-white/15 hover:border-primary/50 text-on-surface hover:text-white transition-all text-xs font-semibold backdrop-blur-md shadow-lg group shrink-0 cursor-pointer"
          title="Ẩn toàn bộ UI để ngắm trọn vẹn chiếc bàn 3D xoay"
        >
          <Icon name="photo_camera" className="text-tertiary group-hover:scale-110 transition-transform text-base" />
          <span>Toàn cảnh bàn 3D</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-space-md">
        <div className={`col-span-12 ${leaderboardCollapsed ? 'xl:col-span-11' : 'xl:col-span-9'} grid transition-all duration-300`}>
          <PlayerSummary player={{ ...user?.profile, email: user?.email }} onOpenCheckIn={() => setCheckInOpen(true)} />
        </div>
        <div className={`col-span-12 lg:col-span-8 ${leaderboardCollapsed ? 'xl:col-span-7' : 'xl:col-span-6'} grid transition-all duration-300`}><LoungeModes /></div>
        <div className={`col-span-12 lg:col-span-4 ${leaderboardCollapsed ? 'xl:col-span-4' : 'xl:col-span-3'} grid min-w-0 transition-all duration-300`}><PartyPanel /></div>
        <div className={`col-span-12 ${leaderboardCollapsed ? 'xl:col-span-11' : 'xl:col-span-9'} grid transition-all duration-300`}><ChampionshipBanner /></div>
        <aside className={`col-span-12 ${leaderboardCollapsed ? 'xl:col-span-1 xl:col-start-12' : 'xl:col-span-3 xl:col-start-10'} xl:row-start-1 xl:row-span-3 grid min-w-0 transition-all duration-300`}>
          <Leaderboard
            collapsed={leaderboardCollapsed}
            onToggleCollapse={() => setLeaderboardCollapsed(current => !current)}
          />
        </aside>
      </div>
    </div>
    {checkInOpen && <DailyCheckInModal onClose={() => setCheckInOpen(false)} />}
  </div>
}
