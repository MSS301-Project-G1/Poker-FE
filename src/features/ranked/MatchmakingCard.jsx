import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router'
import { Button, Icon } from '@/shared/ui'
import { paths } from '@/shared/config/paths'
import { useQueue } from './MatchmakingContext'
import styles from './MatchmakingCard.module.css'

const titles = { NONE: 'Ready to search', WAITING: 'Searching for players', COUNTDOWN: 'Starting soon', MATCHING: 'Matching a table', PROPOSED: 'Match found', CREATING_TABLE: 'Creating table', READY: 'Match in progress', FAILED: 'No match found' }
const clock = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

export default function MatchmakingCard() {
  const state = useQueue()
  const location = useLocation()
  const [now, setNow] = useState(Date.now)
  const card = useRef(null)
  const trigger = useRef(null)
  const previousVisible = useRef(false)
  const { queue, mode, visible, pending, accepted, error, active, inMatch, leaderOnly, open, minimize, close, start, cancel, accept, decline, returnToTable, leaveMatch } = state
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(timer) }, [])
  useEffect(() => {
    if (visible && !previousVisible.current) { trigger.current = document.activeElement; card.current?.focus() }
    if (!visible && previousVisible.current) trigger.current?.focus()
    previousVisible.current = visible
  }, [visible])
  const status = queue?.status
  const proposed = status === 'PROPOSED'
  const deadline = proposed ? queue?.acceptDeadline : queue?.matchStartDeadline
  const remaining = deadline ? Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000)) : null
  const elapsed = queue?.joinedAt ? Math.floor(Math.max(0, now - Date.parse(queue.joinedAt)) / 1000) : 0
  const max = Math.max(2, Math.min(10, queue?.maxPlayers || 6))
  if (!inMatch) return null
  if (location.pathname === paths.ranked) return null
  if (!visible) return active && location.pathname !== paths.lobby ? createPortal(<button className={styles.mini} onClick={inMatch ? returnToTable : () => open(mode)} type="button"><span className={styles.pulse} />{mode === 'NORMAL' ? 'Casual' : 'Ranked'} · {inMatch ? 'Back to table' : 'Back to matchmaking'}</button>, document.body) : null
  return createPortal(<section ref={card} tabIndex={-1} className={styles.card} role="dialog" aria-modal="false" aria-labelledby="queue-title" data-testid="matchmaking-card" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); minimize() } }}>
    <header className={styles.header}><span className={styles.badge}>{mode === 'NORMAL' ? 'CASUAL' : 'RANKED'}</span><button type="button" className={styles.minimize} aria-label="Minimize matchmaking" onClick={minimize}><Icon name="close_fullscreen" /></button></header>
    <h2 id="queue-title">{queue ? titles[status] || status : 'Checking the queue…'}</h2>
    {!inMatch && <p className={styles.elapsed}><Icon name="schedule" />Waited <strong>{clock(elapsed)}</strong></p>}
    {inMatch && <p className={styles.hint}>{mode === 'NORMAL' ? 'Return to the table to keep playing, or leave and take the loss.' : 'Your ranked match is still running. Return to the table to keep playing.'}</p>}
    {queue?.position != null && <p className={styles.hint}>Queue position: #{queue.position}</p>}
    {queue?.playerCount != null && <div className={styles.people} aria-label={`${queue.playerCount} waiting`}><span aria-hidden="true" className={styles.dots}>{Array.from({ length: max }, (_, index) => <i key={index} className={index < queue.playerCount ? styles.filled : ''} />)}</span><strong>{queue.playerCount}/{queue.maxPlayers || max}</strong></div>}
    {status === 'WAITING' && queue?.minPlayers != null && <p className={styles.hint}>Needs at least {queue.minPlayers} players to open a table.</p>}
    {remaining != null && <p className={styles.countdown}>{proposed ? 'Confirm within' : 'Starts in'} <strong>{remaining}s</strong></p>}
    {proposed && <p className={styles.hint}>{accepted ? 'Confirmed. Waiting for the other players.' : 'Every player must confirm before time runs out.'}</p>}
    {status === 'CREATING_TABLE' && <p className={styles.hint}>Preparing the table. You’ll be seated automatically.</p>}
    {status === 'NONE' && <p className={styles.hint}>Choose Find match to start matchmaking.</p>}
    {leaderOnly && ['WAITING', 'COUNTDOWN'].includes(status) && <p className={styles.hint}>Only the party leader can cancel the search.</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.actions}>
      {(status === 'NONE' || status === 'FAILED') && <Button variant="primary" disabled={pending} onClick={() => start(mode)}>Find match</Button>}
      {['WAITING', 'COUNTDOWN'].includes(status) && !leaderOnly && <Button disabled={pending} onClick={cancel}>Cancel search</Button>}
      {proposed && <><Button variant="primary" disabled={pending || accepted || remaining === 0} onClick={accept}>{accepted ? 'Confirmed' : 'Accept match'}</Button><Button disabled={pending || remaining === 0} onClick={decline}>Decline</Button></>}
      {inMatch && <><Button variant="primary" onClick={returnToTable}>Back to table</Button>{mode === 'NORMAL' && <Button disabled={pending} onClick={leaveMatch}>Leave table</Button>}</>}
      {(!status || status === 'NONE' || status === 'FAILED') && <button className={styles.close} type="button" onClick={close}>Close</button>}
    </div>
  </section>, document.body)
}
