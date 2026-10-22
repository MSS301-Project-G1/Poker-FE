import { useCallback, useEffect, useRef, useState } from 'react'
import { leaveTable } from '@/features/game-table'
import { acceptProposal, declineProposal, fetchQueueStatus, joinQueue, leaveQueue } from '../api/matchmakingApi'

export function useMatchmaking(mode) {
  const [queue, setQueue] = useState(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [acceptedId, setAcceptedId] = useState(null)
  const actionBusy = useRef(false)
  const revision = useRef(0)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    const controller = new AbortController()
    let timer
    async function poll() {
      try {
        if (!actionBusy.current) {
          const startedAt = revision.current
          const next = await fetchQueueStatus(mode, controller.signal)
          if (!controller.signal.aborted && !actionBusy.current && startedAt === revision.current) setQueue(next)
        }
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message)
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(poll, 1000)
      }
    }
    void poll()
    return () => { alive.current = false; controller.abort(); clearTimeout(timer) }
  }, [mode])

  const run = useCallback(async (operation, after) => {
    if (actionBusy.current) return false
    actionBusy.current = true
    revision.current += 1
    setPending(true)
    setError('')
    try {
      await operation()
      if (!alive.current) return false
      if (after) after()
      const next = await fetchQueueStatus(mode)
      if (alive.current) setQueue(next)
      return true
    } catch (failure) {
      if (alive.current) setError(failure.message)
      return false
    } finally {
      actionBusy.current = false
      if (alive.current) setPending(false)
    }
  }, [mode])

  return {
    queue, error, pending, accepted: queue?.proposalId === acceptedId,
    join: () => run(() => joinQueue(mode), () => setAcceptedId(null)),
    leave: () => run(() => leaveQueue(mode)),
    accept: () => run(() => acceptProposal(queue.proposalId), () => setAcceptedId(queue.proposalId)),
    decline: () => run(() => declineProposal(queue.proposalId)),
    leaveMatch: () => run(() => leaveTable(queue.tableId)),
  }
}
