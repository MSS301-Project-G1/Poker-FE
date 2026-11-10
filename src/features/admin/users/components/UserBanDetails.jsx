import { useEffect, useState } from 'react'
import { Button } from '@/shared/ui'
import { fetchAdminUser, fetchBanHistory } from '../api/adminUserApi'
import { dateTime, errorMessage } from '../format'

export default function UserBanDetails({ accountId, attempt, onClose }) {
  const [page, setPage] = useState(0)
  const [result, setResult] = useState({ key: null })
  const key = `${accountId}:${attempt}:${page}`
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([fetchAdminUser(accountId, controller.signal), fetchBanHistory(accountId, page, controller.signal)])
      .then(([user, history]) => { if (!controller.signal.aborted) setResult({ key, user, history }) })
      .catch(error => { if (!controller.signal.aborted) setResult({ key, error }) })
    return () => controller.abort()
  }, [accountId, page, key])
  return <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-space-lg" aria-label="Account history">
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-headline-md text-headline-md">Ban history</h2><Button onClick={onClose}>Close details</Button></div>
    {result.key !== key ? <p role="status">Loading history…</p> : result.error ? <p role="alert">{errorMessage(result.error)}</p> : <>
      <p className="mb-1 break-words font-semibold">{result.user.email}</p>
      <p className="mb-4 text-sm text-on-surface-variant">{result.user.banned ? `Banned — ${result.user.bannedUntil ? `until ${dateTime(result.user.bannedUntil)}` : 'until an admin lifts it'}` : 'Not banned'}</p>
      {result.history.content.length === 0 && <p>No ban history.</p>}
      <ol className="space-y-3">{result.history.content.map(event => <li key={event.id} className="rounded-xl bg-surface-container p-4 text-sm">
        <div className="flex flex-wrap justify-between gap-2"><strong>{event.action === 'BAN' ? 'Banned' : 'Unbanned'}</strong><time dateTime={event.occurredAt}>{dateTime(event.occurredAt)}</time></div>
        <p className="mt-2 whitespace-pre-wrap break-words">{event.reason}</p>
        {event.action === 'BAN' && <p className="mt-1 text-on-surface-variant">Duration: {event.until ? dateTime(event.until) : 'Until lifted'}</p>}
        <p className="mt-2 break-all text-xs text-outline">Admin: {event.actorId}</p>
      </li>)}</ol>
      {result.history.totalPages > 1 && <div className="mt-4 flex items-center gap-3"><Button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</Button><span>{page + 1}/{result.history.totalPages}</span><Button disabled={page + 1 >= result.history.totalPages} onClick={() => setPage(value => value + 1)}>Next</Button></div>}
    </>}
  </section>
}
