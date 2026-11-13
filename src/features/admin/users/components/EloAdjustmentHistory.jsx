import { useEffect, useState } from 'react'
import { Button } from '@/shared/ui'
import { fetchEloAdjustments } from '../api/adminUserApi'
import { dateTime, errorMessage } from '../format'

export default function EloAdjustmentHistory({ accountId, attempt }) {
  const [page, setPage] = useState(0)
  const [result, setResult] = useState({ key: null })
  const key = `${accountId}:${attempt}:${page}`
  useEffect(() => {
    const controller = new AbortController()
    fetchEloAdjustments(accountId, page, controller.signal)
      .then(history => { if (!controller.signal.aborted) setResult({ key, history }) })
      .catch(error => { if (!controller.signal.aborted) setResult({ key, error }) })
    return () => controller.abort()
  }, [accountId, page, key])
  return <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-space-lg" aria-label="Elo history">
    <h2 className="mb-4 font-headline-md text-headline-md">Elo history</h2>
    {result.key !== key ? <p role="status">Loading history…</p> : result.error ? <p role="alert">{errorMessage(result.error)}</p> : <>
      {result.history.content.length === 0 && <p>No Elo adjustments.</p>}
      <ol className="space-y-3">{result.history.content.map(event => <li key={event.id} className="rounded-xl bg-surface-container p-4 text-sm">
        <div className="flex flex-wrap justify-between gap-2"><strong>Elo {event.eloBefore} → {event.eloAfter}</strong><time dateTime={event.occurredAt}>{dateTime(event.occurredAt)}</time></div>
        <p className="mt-2 whitespace-pre-wrap break-words">{event.reason}</p>
        <p className="mt-2 break-all text-xs text-outline">Admin: {event.actorId}</p>
      </li>)}</ol>
      {result.history.totalPages > 1 && <div className="mt-4 flex items-center gap-3"><Button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</Button><span>{page + 1}/{result.history.totalPages}</span><Button disabled={page + 1 >= result.history.totalPages} onClick={() => setPage(value => value + 1)}>Next</Button></div>}
    </>}
  </section>
}
