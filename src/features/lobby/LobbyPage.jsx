import { useAuth } from '@/features/auth'
import { useEffect, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router'
import { useQueue } from '@/features/ranked'
import { LobbyBackdrop } from '@/features/demo'
import { PartyPanel } from '@/features/community'
import styles from './LobbyPage.module.css'
import LoungeModes from './components/LoungeModes'
import ChampionshipBanner from './components/ChampionshipBanner'
import DailyCheckInModal from './components/DailyCheckInModal'
import Leaderboard from './components/Leaderboard'
import PlayerSummary from './components/PlayerSummary'
import { useDailyCheckIn } from './hooks/useDailyCheckIn'

export default function LobbyPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const { open } = useQueue()
  const legacyMode = params.get('match')
  useEffect(() => {
    if (legacyMode === 'RANK' || legacyMode === 'NORMAL') {
      open(legacyMode)
    }
  }, [legacyMode, open])
  const [checkInOpen, setCheckInOpen] = useDailyCheckIn()
  const { lobbyZen: zenMode, setLobbyZen: setZenMode } = useOutletContext()
  useEffect(() => () => setZenMode(false), [setZenMode])
  const [leaderboardCollapsed, setLeaderboardCollapsed] = useState(false)

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape' && zenMode) setZenMode(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zenMode, setZenMode])

  return <div className={styles.page}>
    <LobbyBackdrop />

    {/* Main Lobby HUD overlay */}
    <div className={`${styles.hud} transition-all duration-500 ${zenMode ? 'opacity-0 pointer-events-none scale-95 translate-y-4' : 'opacity-100 scale-100'}`}>
      {/* Top Sub-Bar: PlayerSummary */}
      <div className={styles.summary}><PlayerSummary player={{ ...user?.profile, email: user?.email }} onOpenCheckIn={() => setCheckInOpen(true)} /></div>

      {/* 3-Zone Spatial Cockpit: Left Flank | Unobstructed Center Stage | Right Flank */}
      <div className={styles.cockpit}>
        {/* Left Flank: 3 Identical 3D Spatial Cubes */}
        <div className={styles.left}>
          <LoungeModes />
          <PartyPanel />
        </div>

        {/* Center Stage: 100% Unobstructed view of 3D Poker Table */}
        <div className={styles.center} aria-hidden="true" />

        {/* Right Flank: Leaderboard */}
        <aside className={`${styles.leaderboard} ${leaderboardCollapsed ? styles.collapsed : ''}`} >
          <Leaderboard
            collapsed={leaderboardCollapsed}
            onToggleCollapse={() => setLeaderboardCollapsed(current => !current)}
          />
        </aside>
      </div>

      {/* Bottom Championship Banner - Positioned below the table so it never obstructs the felt */}
      <div className={styles.banner}>
        <ChampionshipBanner />
      </div>
    </div>
    {checkInOpen && <DailyCheckInModal onClose={() => setCheckInOpen(false)} />}
  </div>
}
