import { useCallback, useEffect, useRef, useState } from 'react'
import { acceptProposal, declineProposal, fetchQueueStatus, joinQueue, leaveQueue } from '../api/matchmakingApi'

export function useMatchmaking(mode) {
  const [queue, setQueue] = useState(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [acceptedId, setAcceptedId] = useState(null)
  const actionBusy = useRef(false)
  const revision = useRef(0)

  useEffect(() => {
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
    return () => { controller.abort(); clearTimeout(timer) }
  }, [mode])

  const run = useCallback(async (operation, after) => {
    if (actionBusy.current) return false
    actionBusy.current = true
    revision.current += 1
    setPending(true)
    setError('')
    try {
      await operation()
      if (after) after()
      setQueue(await fetchQueueStatus(mode))
      return true
    } catch (failure) {
      setError(failure.message)
      return false
    } finally {
      actionBusy.current = false
      setPending(false)
    }
  }, [mode])

  return {
    queue, error, pending, accepted: queue?.proposalId === acceptedId,
    join: () => run(() => joinQueue(mode), () => setAcceptedId(null)),
    leave: () => run(() => leaveQueue(mode)),
    accept: () => run(() => acceptProposal(queue.proposalId), () => setAcceptedId(queue.proposalId)),
    decline: () => run(() => declineProposal(queue.proposalId)),
  }
}
