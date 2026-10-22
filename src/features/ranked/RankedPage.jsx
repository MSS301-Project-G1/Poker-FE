import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Button, Icon } from '@/shared/ui'
import { useMatchmaking } from './hooks/useMatchmaking'

const labels = {
  NONE: 'Ready to find a match', WAITING: 'Looking for players', COUNTDOWN: 'Gathering the table',
  MATCHING: 'Preparing your match', PROPOSED: 'Match found', CREATING_TABLE: 'Creating your table', READY: 'Table ready',
}

export default function RankedPage() {
  const [params] = useSearchParams()
  const mode = params.get('mode') === 'NORMAL' ? 'NORMAL' : 'RANK'
  return <QueuePanel key={mode} mode={mode} />
}

function QueuePanel({ mode }) {
  const navigate = useNavigate()
  const { queue, error, pending, accepted, join, leave, accept, decline } = useMatchmaking(mode)
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    if (queue?.status === 'READY' && queue.tableId) navigate(paths.tableById(queue.tableId), { replace: true })
  }, [queue, navigate])

  const status = queue?.status
  const proposed = status === 'PROPOSED'
  const deadline = proposed ? queue.acceptDeadline : queue?.matchStartDeadline
  const seconds = deadline ? Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000)) : null
  const canLeave = status === 'WAITING' || status === 'COUNTDOWN'
  const idle = status === 'NONE'

  const cancel = async () => { if (await leave()) navigate(paths.lobby) }
  return <div className="flex min-h-[70vh] items-center justify-center p-space-lg">
    <section className="w-full max-w-2xl rounded-xl bg-surface-container-low p-space-lg shadow-dialog" aria-labelledby="queue-title">
      <div className="flex items-center gap-space-sm text-primary">
        <Icon name={mode === 'RANK' ? 'military_tech' : 'groups'} />
        <span>{mode === 'RANK' ? 'Ranked matchmaking' : 'Normal matchmaking'}</span>
      </div>
      <h1 id="queue-title" className="mt-space-md font-headline-lg text-headline-lg">{queue ? labels[status] || status : 'Checking your queue...'}</h1>
      <div role="status" aria-live="polite" className="my-space-lg flex flex-col gap-space-sm text-on-surface-variant">
        {queue?.playerCount != null && <p>{queue.playerCount} players waiting · Table size {queue.minPlayers}–{queue.maxPlayers}</p>}
        {queue?.position != null && <p>Your queue position: {queue.position}</p>}
        {seconds != null && <p>{proposed ? 'Accept within' : 'Filling the table for'} {seconds}s</p>}
        {proposed && <p>{accepted ? 'Accepted. Waiting for the other players.' : 'All players must accept before the deadline.'}</p>}
        {status === 'CREATING_TABLE' && <p>Preparing your table. This page will open it when ready.</p>}
        {idle && <p>{mode === 'RANK' ? 'Players are matched by Elo. The entry fee is collected after everyone accepts.' : 'Join solo or queue with your party. No entry fee or acceptance is required.'}</p>}
      </div>
      {error && <p role="alert" className="mb-space-md text-error">{error}</p>}
      <div className="flex flex-wrap gap-space-sm">
        {idle && <Button variant="primary" disabled={pending} onClick={join}>Find match</Button>}
        {canLeave && <Button disabled={pending} onClick={cancel}>Cancel queue</Button>}
        {proposed && <>
          <Button variant="primary" disabled={pending || accepted || seconds === 0} onClick={accept}>{accepted ? 'Accepted' : 'Accept match'}</Button>
          <Button disabled={pending || seconds === 0} onClick={decline}>Decline match</Button>
        </>}
        {(idle || !queue) && <Button onClick={() => navigate(paths.lobby)}>Back to lobby</Button>}
      </div>
    </section>
  </div>
}
