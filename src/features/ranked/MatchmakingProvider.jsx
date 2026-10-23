import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/features/auth'
import { paths } from '@/shared/config/paths'
import { useSound } from '@/shared/audio'
import { confirmLeaveMatch } from '@/features/game-table'
import { MatchmakingContext } from './MatchmakingContext'
import { useMatchmaking } from './hooks/useMatchmaking'

const isActive = state => state && !['NONE', 'FAILED'].includes(state.status)
export default function MatchmakingProvider({ children }) {
  const { status, user } = useAuth()
  return status === 'authenticated' ? <PlayerQueue key={user.accountId}>{children}</PlayerQueue> : children
}

function PlayerQueue({ children }) {
  const rank = useMatchmaking('RANK')
  const normal = useMatchmaking('NORMAL')
  const [selection, setSelection] = useState(null)
  const [requested, setRequested] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [dismissedProposal, setDismissedProposal] = useState(null)
  const busy = useRef(false)
  const openedTable = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { play } = useSound()
  const activeMode = isActive(normal.queue) ? 'NORMAL' : isActive(rank.queue) ? 'RANK' : null
  const mode = activeMode || selection
  const current = mode === 'NORMAL' ? normal : rank
  const queue = mode ? current.queue : null
  const pending = rank.pending || normal.pending
  const active = Boolean(activeMode)
  const forceProposal = queue?.status === 'PROPOSED' && !current.accepted && dismissedProposal !== queue.proposalId
  const visible = Boolean(mode && (requested || active) && (!minimized || forceProposal))
  const open = useCallback(chosen => {
    setSelection(chosen)
    setRequested(true)
    setMinimized(false)
    navigate(chosen === 'NORMAL' ? `${paths.ranked}?mode=NORMAL` : paths.ranked)
  }, [navigate])
  const minimize = () => { setMinimized(true); setDismissedProposal(queue?.proposalId || null) }
  const close = () => { setRequested(false); setMinimized(true) }

  async function start(chosen) {
    if (busy.current || pending || active) { open(activeMode || chosen); return }
    busy.current = true
    open(chosen)
    play('shuffle')
    try { await (chosen === 'NORMAL' ? normal : rank).join() } finally { busy.current = false }
  }
  async function cancel() {
    if (await current.leave()) { close(); play('fold') }
  }
  async function accept() { if (await current.accept()) play('check') }
  async function decline() { if (await current.decline()) { close(); play('fold') } }

  const queueStatus = queue?.status
  const tableId = queue?.tableId
  // READY with a table means the match is running: the lobby offers a way back, or a forfeit in Normal mode.
  const inMatch = queueStatus === 'READY' && Boolean(tableId)
  function returnToTable() { minimize(); navigate(paths.tableById(tableId)) }
  async function leaveMatch() {
    if (!confirmLeaveMatch()) return
    if (await current.leaveMatch()) { close(); play('fold') }
  }
  const proposalId = queue?.proposalId
  useEffect(() => {
    if (queueStatus === 'PROPOSED') play('match')
    if (queueStatus === 'READY' && tableId) play('win')
  }, [queueStatus, tableId, proposalId, play])
  useEffect(() => {
    if (queueStatus !== 'READY') openedTable.current = null
    if (queueStatus === 'READY' && tableId && location.pathname !== paths.demo && openedTable.current !== tableId) {
      openedTable.current = tableId
      navigate(paths.tableById(tableId), { replace: true })
    }
  }, [queueStatus, tableId, navigate, location.pathname])

  return <MatchmakingContext.Provider value={{ rank, normal, mode, queue, active, activeMode, inMatch, visible, pending, accepted: current.accepted, error: mode ? current.error : '', start, open, minimize, close, cancel, accept, decline, returnToTable, leaveMatch }}>{children}</MatchmakingContext.Provider>
}
