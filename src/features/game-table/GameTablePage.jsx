import { useContext, useEffect, useRef, useState } from 'react'
import { useSound } from '@/shared/audio'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { TableTheme } from '@/shared/skin'
import { env } from '@/shared/config/env'
import { paths } from '@/shared/config/paths'
import { MatchChat } from '@/features/community'
import { useAuth } from '@/features/auth'
import { devIdentity } from '@/shared/lib/devIdentity'
import { Button, Eyebrow, Icon, PlaceholderScreen, useConfirm } from '@/shared/ui'
import { GameRuntimeContext } from './runtime'
import { useGameSession } from './hooks/useGameSession'
import { useSeatProfiles } from './hooks/useSeatProfiles'
import { useMatchRewards } from './hooks/useMatchRewards'
import { leaveMatchPrompt, leaveTable } from './api/gameApi'
import { placeSeats } from './seatLayout'
import { label, modeLabels, playerName, resultLine } from './labels'
import { useTablePresentation } from './presentation/useTablePresentation'
import Board from './components/Board'
import PlayerSeat from './components/PlayerSeat'
import ActionDock from './components/ActionDock'
import TurnTimer from './components/TurnTimer'
import YourTurnBadge from './components/YourTurnBadge'
import TableInfo from './components/TableInfo'
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
  const tableRef = useRef(null)
  const flightsRef = useRef(null)
  const auth = useAuth()
  const navigate = useNavigate()
  const runtime = useContext(GameRuntimeContext)
  const devUser = devIdentity()
  const session = useGameSession({ tableId, devUser, getAccessToken: runtime.getAccessToken })
  const { snapshot } = session
  const signedIn = auth.status === 'authenticated' && !devUser
  const seatProfiles = useSeatProfiles(snapshot?.seats.map(seat => seat.accountId) || [], signedIn)
  const matchRewards = useMatchRewards(snapshot?.matchId, signedIn && snapshot?.mode === 'RANK' && snapshot?.street === 'FINISHED')
  const show = useTablePresentation(snapshot, { play, tableRef, layerRef: flightsRef })
  const profiles = { ...seatProfiles, ...runtime.profiles }
  const ChatPanel = runtime.ChatPanel
  const finished = snapshot?.street === 'FINISHED'
  const me = snapshot?.seats.find(seat => seat.accountId === snapshot.accountId)
  // While the player is still in play, the header offers no way out except an explicit forfeit.
  const inMatch = Boolean(snapshot) && !finished && !me?.eliminated && !me?.leftEarly
  const [leaving, setLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState('')
  const confirm = useConfirm()
  async function leave() {
    if (!await confirm(leaveMatchPrompt)) return
    setLeaving(true)
    setLeaveError('')
    try {
      await leaveTable(snapshot.tableId, { devUser })
      navigate(paths.lobby)
    } catch (error) {
      setLeaveError(error.message)
      setLeaving(false)
    }
  }
  const handOver = snapshot?.street === 'HAND_FINISHED' || finished
  const winners = show.resultShown ? snapshot.distribution?.pots.flatMap(pot => pot.winnerSeats) ?? [] : []
  const timer = snapshot && { deadline: snapshot.deadline, serverTime: snapshot.serverTime, receivedAt: snapshot.receivedAt, paused: snapshot.street === 'HAND_FINISHED' }
  const yourTurn = snapshot?.legalActions.length > 0
  const turnMillis = snapshot ? Date.parse(snapshot.deadline) - Date.parse(snapshot.serverTime) : 0
  const nameOf = seat => playerName(profiles[seat.accountId], seat.accountId)
  useEffect(() => {
    if (!yourTurn) return undefined
    const title = document.title
    document.title = `● YOUR TURN · ${title}`
    return () => { document.title = title }
  }, [yourTurn])
  return <div className={styles.page}>
    <header className={styles.header}>{inMatch ? <span className={styles.brand}><span>♠</span> POKER<span>RANK</span></span> : <Link to={paths.lobby} className={styles.brand}><span>♠</span> POKER<span>RANK</span></Link>}
      <nav className={styles.headerNav}><HandGuide />{!inMatch && <Button className={styles.compactButton} onClick={() => navigate(paths.lobby)}>Lobby</Button>}
        {inMatch && snapshot.mode === 'NORMAL' && <Button className={styles.compactButton} disabled={leaving} onClick={leave}>Rời ván</Button>}</nav></header>
    {session.phase === 'loading' && <div className={styles.state} role="status"><div className={styles.spinner} /><h1>Finding your table…</h1></div>}
    {session.phase === 'empty' && <main className={styles.state}><span className={styles.stateIcon}>♠</span><h1>No active table</h1><p>{session.error || 'Join a match from the lobby. Your active table will appear here.'}</p><Button variant="primary" onClick={() => navigate(paths.lobby)}>Go to lobby</Button>{env.gameDevMode && <DevLauncher />}</main>}
    {session.phase === 'error' && <main className={styles.state}><span className={styles.stateIcon}>♠</span><h1>Unable to open this table</h1><p className={styles.error} role="alert">{session.error}</p><Button variant="primary" onClick={retry}>Try again</Button>{env.gameDevMode && <DevLauncher />}</main>}
    {snapshot && <main className={styles.arena}>
      <div className={styles.infoBar}>
        <div className={styles.tableName}><span className={`${styles.connection} ${styles[session.connection] || ''}`}><i />{session.connection === 'connected' ? 'LIVE' : session.connection.toUpperCase()}</span>
          <strong>BÀN #{snapshot.tableId.slice(-6).toUpperCase()}</strong><span className={styles.tag}>{label(modeLabels, snapshot.mode)}</span><span className={styles.muted}>NO LIMIT HOLD’EM</span></div>
        <div className={styles.tableMeta}>{!finished && <TurnTimer {...timer} label={yourTurn ? 'LƯỢT CỦA BẠN' : undefined} />}<span className={styles.pill}><Icon name="history" /> VÁN SỐ #{snapshot.handNumber}</span>
          {session.connection !== 'connected' && <Button className={styles.compactButton} onClick={retry}>Reconnect</Button>}</div>
      </div>
      {session.error && <div className={styles.alert} role="alert">{session.error}</div>}
      {leaveError && <div className={styles.alert} role="alert">{leaveError}</div>}
      <TableTheme ref={tableRef} className={styles.table} glow={yourTurn}>
        <div className={styles.center}><Board cards={snapshot.board} pot={snapshot.pot} distribution={snapshot.distribution} street={snapshot.street}
          revealDelays={show.boardDelays} result={show.resultShown && snapshot.distribution ? resultLine(snapshot, nameOf) : null}
          badge={yourTurn && <YourTurnBadge key={snapshot.actionSequence} {...timer} />} /></div>
        {placeSeats(snapshot.seats, snapshot.accountId).map(({ player, slot }) => {
          const active = player.seatIndex === snapshot.actorSeat && !handOver
          const winner = winners.includes(player.seatIndex)
          return <PlayerSeat key={player.accountId} player={player} profile={profiles[player.accountId]} slot={slot} isYou={player.accountId === snapshot.accountId}
            active={active} dealer={player.seatIndex === snapshot.dealerSeat}
            smallBlind={player.seatIndex === snapshot.smallBlindSeat} bigBlind={player.seatIndex === snapshot.bigBlindSeat} winner={winner}
            chips={show.paying ? player.chips - (snapshot.distribution.winnings[player.seatIndex] ?? 0) : player.chips} bet={handOver ? 0 : player.streetBet}
            revealDelays={show.reveals[player.seatIndex]} turnMillis={active ? turnMillis : 0} turnKey={snapshot.actionSequence}
            showHand={show.resultShown} paid={winner && !show.paying} />
        })}
      </TableTheme>
      <div ref={flightsRef} className={styles.flights} aria-hidden="true" />
      <div className={styles.bottom}>
        <section className={styles.chatSlot} aria-label="Table chat">{ChatPanel ? <ChatPanel conversationId={snapshot.matchId} /> : auth.status === 'authenticated' && snapshot.matchId ? <MatchChat key={snapshot.matchId} matchId={snapshot.matchId} finished={finished} /> : <div className={styles.chatNote}><Eyebrow>CHAT BÀN ĐẤU</Eyebrow><p>Đăng nhập để mở phòng chat của trận.</p></div>}</section>
        <div className={styles.dockSlot}><p className={styles.turnCaption} role="status">{session.pending ? 'Đang gửi thao tác…' : snapshot.street === 'HAND_FINISHED' ? 'Ván đã xong. Ván mới sắp bắt đầu.' : snapshot.legalActions.length ? 'Đến lượt bạn. Chọn thao tác.' : 'Đang chờ người chơi khác…'}</p>
          <ActionDock key={snapshot.actionSequence} legalActions={snapshot.legalActions} callAmount={snapshot.callAmount} minRaiseTo={snapshot.minRaiseTo} maxRaiseTo={snapshot.maxRaiseTo} pot={snapshot.pot}
            disabled={session.pending || session.connection !== 'connected'} onAction={session.send} /></div>
        <TableInfo snapshot={snapshot} me={me} />
      </div>
      {finished && show.dialogShown && <MatchResult mode={snapshot.mode} placements={snapshot.placements} accountId={snapshot.accountId} profiles={profiles} rewards={runtime.rewards || matchRewards} onExit={() => navigate(paths.lobby)} />}
    </main>}
    <footer className={styles.footer}><span>NO-LIMIT TEXAS HOLD’EM</span><span>Chip trên bàn chỉ dùng trong trận này.</span></footer>
  </div>
}
