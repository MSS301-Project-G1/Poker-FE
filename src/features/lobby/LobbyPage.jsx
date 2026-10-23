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
    <div className={`relative z-10 w-full max-w-[1720px] mx-auto flex flex-col gap-space-md transition-all duration-500 ${zenMode ? 'opacity-0 pointer-events-none scale-95 translate-y-4' : 'opacity-100 scale-100'}`}>
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

      {/* Top Sub-Bar: PlayerSummary */}
      <PlayerSummary player={{ ...user?.profile, email: user?.email }} onOpenCheckIn={() => setCheckInOpen(true)} />

      {/* 3-Zone Spatial Cockpit: Left Flank | Unobstructed Center Stage | Right Flank */}
      <div className="flex flex-col lg:flex-row gap-space-md w-full items-start relative mt-4">
        {/* Left Flank: 3 Identical 3D Spatial Cubes */}
        <div className="w-full lg:w-[325px] xl:w-[340px] shrink-0 flex flex-col gap-8 z-20 pt-4">
          <LoungeModes />
          <PartyPanel />
        </div>

        {/* Center Stage: 100% Unobstructed view of 3D Poker Table */}
        <div className="flex-1 min-h-[480px] lg:min-h-[600px] flex flex-col justify-start items-center pointer-events-none relative w-full pt-2">
          {/* Subtle camera view button in center ceiling */}
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={() => setZenMode(true)}
              className="opacity-40 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/30 hover:bg-surface-container-lowest/60 border border-white/10 hover:border-primary/40 text-[11px] text-on-surface-variant hover:text-white backdrop-blur-md cursor-pointer"
            >
              <Icon name="crop_free" className="text-xs text-primary" />
              <span>Chạm để ẩn UI ngắm bàn 3D</span>
            </button>
          </div>
        </div>

        {/* Right Flank: Leaderboard */}
        <aside className={`w-full ${leaderboardCollapsed ? 'lg:w-[64px]' : 'lg:w-[300px] xl:w-[320px]'} shrink-0 z-20 transition-all duration-300`}>
          <Leaderboard
            collapsed={leaderboardCollapsed}
            onToggleCollapse={() => setLeaderboardCollapsed(current => !current)}
          />
        </aside>
      </div>

      {/* Bottom Championship Banner - Positioned below the table so it never obstructs the felt */}
      <div className="w-full mt-2 z-20">
        <ChampionshipBanner />
      </div>
    </div>
    {checkInOpen && <DailyCheckInModal onClose={() => setCheckInOpen(false)} />}
  </div>
}
