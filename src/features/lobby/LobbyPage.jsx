import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useQueue } from '@/features/ranked'
import { LobbyBackdrop } from '@/features/demo'
import { PartyPanel } from '@/features/community'
import { useLeaderboardPreview } from '@/features/ranking'
import { useNextTournament } from '@/features/tournament'
import { useTutorialStatus } from '@/features/tutorial'
import LoungeModes from './components/LoungeModes'
import ChampionshipBanner from './components/ChampionshipBanner'
import FloatingPanel, { FloatingColumn } from './components/FloatingPanel'
import Leaderboard from './components/Leaderboard'
import MoreModes from './components/MoreModes'

export default function LobbyPage() {
  const [params] = useSearchParams()
  const { open } = useQueue()
  const legacyMode = params.get('match')
  useEffect(() => {
    if (legacyMode === 'RANK' || legacyMode === 'NORMAL') {
      open(legacyMode)
    }
  }, [legacyMode, open])
  const [leaderboardCollapsed, setLeaderboardCollapsed] = useState(false)
  const standings = useLeaderboardPreview(5)
  const featured = useNextTournament()
  const [tutorial] = useTutorialStatus()

  // Desktop: exactly one screen tall (min height only for very short windows), so the lobby never scrolls.
  return <div className="flex flex-col w-full relative py-space-sm px-margin-mobile lg:px-margin lg:h-[var(--page-height)] lg:min-h-[600px]">
    <LobbyBackdrop />

    {/* Panels float around the 3D table: game modes on the left, standings on the right, the tournament on the pedestal below */}
    <div className={`relative z-10 w-full max-w-[1720px] mx-auto grid grid-cols-1 flex-1 min-h-0 gap-space-md ${leaderboardCollapsed ? 'lg:grid-cols-[minmax(280px,330px)_minmax(0,1fr)_64px]' : 'lg:grid-cols-[minmax(280px,330px)_minmax(0,1fr)_minmax(280px,330px)]'}`}>
      {/* Both side columns use the same gap and padding, so they sit in the same vertical band */}
      <FloatingColumn side="left" className="flex min-h-0 flex-col [justify-content:safe_center] gap-space-md lg:pb-16">
        <LoungeModes />
        <FloatingPanel side="left"><PartyPanel /></FloatingPanel>
      </FloatingColumn>

      {/* Center Stage: the table stays visible; only the pedestal panel sits at its foot */}
      <div className="order-last lg:order-none flex min-h-0 flex-col items-center justify-end pointer-events-none">
        <FloatingPanel side="bottom" className="w-full max-w-[760px] pointer-events-auto z-20">
          <ChampionshipBanner featured={featured} />
        </FloatingPanel>
      </div>

      {/* Right flank: leaderboard, then the other modes; bottom padding keeps clear of the fixed "Friends & party" dock */}
      <FloatingColumn side="right" as="aside" className="flex min-h-0 flex-col [justify-content:safe_center] gap-space-md lg:pb-16">
        <FloatingPanel side="right">
          <Leaderboard
            standings={standings}
            collapsed={leaderboardCollapsed}
            onToggleCollapse={() => setLeaderboardCollapsed(current => !current)}
          />
        </FloatingPanel>
        <FloatingPanel side="right"><MoreModes tutorial={tutorial} collapsed={leaderboardCollapsed} /></FloatingPanel>
      </FloatingColumn>
    </div>
  </div>
}
