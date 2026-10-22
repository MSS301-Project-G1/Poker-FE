import { useContext, useEffect, useRef, useState } from 'react'
import { useSound } from '@/shared/audio'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { TableTheme } from '@/shared/skin'
import { env } from '@/shared/config/env'
import { paths } from '@/shared/config/paths'
import { MatchChat } from '@/features/community'
import { useAuth } from '@/features/auth'
import { devIdentity } from '@/shared/lib/devIdentity'
import { Button, Eyebrow, PlaceholderScreen } from '@/shared/ui'
import { GameRuntimeContext } from './runtime'
import { useGameSession } from './hooks/useGameSession'
import { useSeatProfiles } from './hooks/useSeatProfiles'
import Board from './components/Board'
import PlayerSeat from './components/PlayerSeat'
import ActionDock from './components/ActionDock'
import TurnTimer from './components/TurnTimer'
import MatchResult from './components/MatchResult'
import HandGuide from './components/HandGuide'
import DevLauncher from './components/DevLauncher'
import styles from './GameTablePage.module.css'

const tableIdPattern = /^[0-9a-f-]{36}$/i

// /table opens the player's active table; /table/:tableId opens a specific one.
export default function GameTablePage() {
  const { tableId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(0)
  if (tableId && !tableIdPattern.test(tableId)) {
    return <PlaceholderScreen title="Page not found" message="This table link is not valid.">
      <Button variant="primary" onClick={() => navigate(paths.lobby)}>Back to Lobby</Button>
    </PlaceholderScreen>
  }
  const sessionKey = `${tableId || 'active'}:${searchParams.get('devUser') || ''}:${attempt}`
  return <GameSession key={sessionKey} tableId={tableId} retry={() => setAttempt(value => value + 1)} />
}

function GameSession({ tableId, retry }) {
  const { play } = useSound()
  const previousSnapshot = useRef(null)
  const auth = useAuth()
  const navigate = useNavigate()
  const runtime = useContext(GameRuntimeContext)
  const devUser = devIdentity()
  const session = useGameSession({ tableId, devUser, getAccessToken: runtime.getAccessToken })
  const { snapshot } = session
  const signedIn = auth.status === 'authenticated' && !devUser
  const seatProfiles = useSeatProfiles(snapshot?.seats.map(seat => seat.accountId) || [], signedIn)
  useEffect(() => {
    if (!snapshot) return
    const previous = previousSnapshot.current
    if (!previous || previous.handNumber !== snapshot.handNumber) play('shuffle')
    else if (snapshot.street === 'FINISHED' && previous.street !== 'FINISHED') play('win')
    else if (snapshot.board.length !== previous.board.length) play('card')
    else if (snapshot.actorSeat !== previous.actorSeat && snapshot.seats.some(seat => seat.accountId === snapshot.accountId && seat.seatIndex === snapshot.actorSeat)) play('turn')
    else if (snapshot.pot > previous.pot) play('chip')
    previousSnapshot.current = snapshot
  }, [snapshot, play])
  const profiles = { ...seatProfiles, ...runtime.profiles }
  const ChatPanel = runtime.ChatPanel
  const finished = snapshot?.street === 'FINISHED'
  const winners = snapshot?.distribution?.pots.flatMap(pot => pot.winnerSeats) || []
  const seatCount = snapshot?.seats.length
  const seatsClass = [styles.seats, styles[`seats${seatCount}`], seatCount >= 7 && styles.crowded].filter(Boolean).join(' ')
  return <div className={styles.page}>
    <header className={styles.header}><Link to={paths.lobby} className={styles.brand}><span>♠</span> POKER<span>RANK</span></Link>
      <div className={styles.tableLabel}><Eyebrow>{snapshot?.mode || 'TEXAS HOLD’EM'}</Eyebrow><strong>{snapshot ? `Table ${snapshot.tableId.slice(-6)} · Hand ${snapshot.handNumber}` : 'Your next hand awaits'}</strong></div>
      <nav className={styles.headerNav}><HandGuide /><Button className={styles.compactButton} onClick={() => navigate(paths.lobby)}>Lobby</Button></nav></header>
    {session.phase === 'loading' && <div className={styles.state} role="status"><div className={styles.spinner} /><h1>Finding your table…</h1></div>}
    {session.phase === 'empty' && <main className={styles.state}><span className={styles.stateIcon}>♠</span><h1>No active table</h1><p>{session.error || 'Join a match from the lobby. Your active table will appear here.'}</p><Button variant="primary" onClick={() => navigate(paths.lobby)}>Go to lobby</Button>{env.gameDevMode && <DevLauncher />}</main>}
    {session.phase === 'error' && <main className={styles.state}><span className={styles.stateIcon}>♠</span><h1>Unable to open this table</h1><p className={styles.error} role="alert">{session.error}</p><Button variant="primary" onClick={retry}>Try again</Button>{env.gameDevMode && <DevLauncher />}</main>}
    {snapshot && <main className={styles.arena}>
      <div className={styles.status}><span className={`${styles.connection} ${styles[session.connection] || ''}`}><i />{session.connection === 'connected' ? 'LIVE' : session.connection.toUpperCase()}</span>
        <span>{snapshot.street.replaceAll('_', ' ')}</span>{!finished && <TurnTimer deadline={snapshot.deadline} serverTime={snapshot.serverTime} receivedAt={snapshot.receivedAt} paused={snapshot.street === 'HAND_FINISHED'} />}
        {session.connection !== 'connected' && <Button className={styles.compactButton} onClick={retry}>Reconnect</Button>}</div>
      {session.error && <div className={styles.alert} role="alert">{session.error}</div>}
      <TableTheme>
        <div className={`${styles.boardSlot} ${seatCount === 7 || seatCount === 8 ? styles.high : ''}`}><Board cards={snapshot.board} pot={snapshot.pot} distribution={snapshot.distribution} /></div>
        <div className={seatsClass}>{snapshot.seats.map(player => <PlayerSeat key={player.accountId} player={player} profile={profiles[player.accountId]}
          isYou={player.accountId === snapshot.accountId} active={player.seatIndex === snapshot.actorSeat} dealer={player.seatIndex === snapshot.dealerSeat}
          smallBlind={player.seatIndex === snapshot.smallBlindSeat} bigBlind={player.seatIndex === snapshot.bigBlindSeat} winner={winners.includes(player.seatIndex)} />)}</div>
      </TableTheme>
      <div className={styles.bottom}><section className={styles.chatSlot} aria-label="Table chat">{ChatPanel ? <ChatPanel conversationId={snapshot.matchId} /> : auth.status === 'authenticated' && snapshot.matchId ? <MatchChat key={snapshot.matchId} matchId={snapshot.matchId} finished={finished} /> : <><Eyebrow>TABLE CHAT</Eyebrow><p>Sign in to open the match conversation.</p></>}</section>
        <div><p className={styles.turnCaption} role="status">{session.pending ? 'Sending your action…' : snapshot.street === 'HAND_FINISHED' ? 'Hand complete. Next hand starts shortly.' : snapshot.legalActions.length ? 'Your move. Make it count.' : 'Waiting for the next action.'}</p>
          <ActionDock key={snapshot.actionSequence} legalActions={snapshot.legalActions} callAmount={snapshot.callAmount} minRaiseTo={snapshot.minRaiseTo} maxRaiseTo={snapshot.maxRaiseTo} pot={snapshot.pot}
            disabled={session.pending || session.connection !== 'connected'} onAction={session.send} /></div>
      </div>
      {finished && <MatchResult mode={snapshot.mode} placements={snapshot.placements} accountId={snapshot.accountId} profiles={profiles} rewards={runtime.rewards} onExit={() => navigate(paths.lobby)} />}
    </main>}
    <footer className={styles.footer}><span>NO-LIMIT TEXAS HOLD’EM</span><span>Table chips stay in this match.</span></footer>
  </div>
}
