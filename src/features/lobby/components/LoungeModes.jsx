import { useEffect, useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { gatewayRequest } from '@/shared/api/gatewayClient'
import { useQueue } from '@/features/ranked'
import FloatingPanel from './FloatingPanel'
import styles from './LoungeModes.module.css'

export default function LoungeModes() {
  const { active, activeMode, inMatch, queue, start, open, pending, error: queueError, returnToTable, leaveMatch } = useQueue()
  const [state, setState] = useState({ loading: true, party: null, error: '' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    let timer
    async function refresh() {
      try {
        const party = await gatewayRequest('/api/party/me', { signal: controller.signal })
        if (!controller.signal.aborted) setState({ loading: false, party: party?.partyId ? party : null, error: '' })
      } catch (error) {
        if (!controller.signal.aborted) setState(previous => ({ ...previous, loading: false, error: error.message }))
      } finally { if (!controller.signal.aborted) timer = setTimeout(refresh, 5000) }
    }
    void refresh()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [attempt])
  return <section aria-label="Game modes" className={styles.section}>
    {state.error && <p className={styles.error} role="alert">{state.error} <button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button></p>}
    {inMatch ? <FloatingPanel side="left"><div className={styles.resume}><span className={styles.pulse} /><div><h2>You’re in a match</h2><p>{activeMode === 'NORMAL' ? 'Casual' : 'Ranked'} · Your match is still running</p>{queueError && <p className={styles.error} role="alert">{queueError}</p>}</div><span className={styles.resumeActions}><Button variant="primary" onClick={returnToTable}>Back to table</Button>{activeMode === 'NORMAL' && <Button disabled={pending} onClick={leaveMatch}>Leave table</Button>}</span></div></FloatingPanel>
      : active ? <FloatingPanel side="left"><div className={styles.resume}><span className={styles.pulse} /><div><h2>You’re in the queue</h2><p>{activeMode === 'NORMAL' ? 'Casual' : 'Ranked'} · {queue?.playerCount != null ? `${queue.playerCount}/${queue.maxPlayers || 6} players` : 'Matching a table'}</p></div><Button variant="primary" onClick={() => open(activeMode)}>Back to matchmaking</Button></div></FloatingPanel> : <div className={styles.grid}>
      <FloatingPanel side="left"><article className={`${styles.card} ${styles.rank}`}>
        <header className={styles.cardHead}>
          <span className={styles.modeIcon} aria-hidden="true"><Icon name="workspace_premium" filled /></span>
          <div className={styles.cardTitle}><h2>Ranked</h2></div>
        </header>
        <p className={styles.tagline}>6 players · Solo</p>
        <div className={styles.metaRow}>
          <span>Matched by Elo</span>
          <span className={styles.dot} aria-hidden="true">·</span>
          <span>Confirm when a match is found</span>
        </div>
        <Button variant="primary" disabled={pending || state.loading || Boolean(state.error) || Boolean(state.party)} onClick={() => start('RANK')}><Icon name="swords" />Find ranked match</Button>
        {state.party && <small>Leave your party room to play ranked.</small>}
      </article></FloatingPanel>
    </div>}
  </section>
}
