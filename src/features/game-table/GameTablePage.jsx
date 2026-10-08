import { useContext, useState } from 'react'
import { TableTheme } from '../../shared/skin'
import { GameRuntimeContext, devIdentity, gameDevMode } from './runtime'
import { useGameSession } from './useGameSession'
import Board from './components/Board'
import PlayerSeat from './components/PlayerSeat'
import ActionDock from './components/ActionDock'
import TurnTimer from './components/TurnTimer'
import MatchResult from './components/MatchResult'
import HandGuide from './components/HandGuide'
import DevLauncher from './DevLauncher'
import './game-table.css'

export default function GameTablePage({ tableId, navigate }) {
  const [attempt, setAttempt] = useState(0)
  return <GameSession key={`${tableId || 'active'}:${attempt}`} tableId={tableId} navigate={navigate} retry={() => setAttempt(value => value + 1)} />
}

function GameSession({ tableId, navigate, retry }) {
  const runtime = useContext(GameRuntimeContext)
  const session = useGameSession({ tableId, devUser: devIdentity(), getAccessToken: runtime.getAccessToken })
  const { snapshot } = session
  const profiles = runtime.profiles
  const ChatPanel = runtime.ChatPanel
  const finished = snapshot?.street === 'FINISHED'
  const winners = snapshot?.distribution?.pots.flatMap(pot => pot.winnerSeats) || []
  return <div className="game-page">
    <header className="game-header"><a href="/lobby" className="game-brand"><span>♠</span> POKER<span>RANK</span></a>
      <div className="game-table-label"><span className="game-eyebrow">{snapshot?.mode || 'TEXAS HOLD’EM'}</span><strong>{snapshot ? `Table ${snapshot.tableId.slice(-6)} · Hand ${snapshot.handNumber}` : 'Your next hand awaits'}</strong></div>
      <nav><HandGuide /><button className="game-secondary" onClick={() => navigate('/lobby')}>Lobby</button></nav></header>
    {session.phase === 'loading' && <div className="game-state" role="status"><div className="game-spinner" /><h1>Finding your table…</h1></div>}
    {session.phase === 'empty' && <main className="game-state"><span className="game-state-icon">♠</span><h1>No active table</h1><p>{session.error || 'Join a match from the lobby. Your active table will appear here.'}</p><button className="game-primary" onClick={() => navigate('/lobby')}>Go to lobby</button>{gameDevMode && <DevLauncher navigate={navigate} />}</main>}
    {session.phase === 'error' && <main className="game-state"><span className="game-state-icon">♠</span><h1>Unable to open this table</h1><p className="game-error" role="alert">{session.error}</p><button className="game-primary" onClick={retry}>Try again</button>{gameDevMode && <DevLauncher navigate={navigate} />}</main>}
    {snapshot && <main className="game-arena">
      <div className="game-status"><span className={`game-connection game-connection-${session.connection}`}><i />{session.connection === 'connected' ? 'LIVE' : session.connection.toUpperCase()}</span>
        <span>{snapshot.street.replaceAll('_', ' ')}</span>{!finished && <TurnTimer deadline={snapshot.deadline} serverTime={snapshot.serverTime} receivedAt={snapshot.receivedAt} paused={snapshot.street === 'HAND_FINISHED'} />}
        {session.connection !== 'connected' && <button className="game-secondary" onClick={retry}>Reconnect</button>}</div>
      {session.error && <div className="game-alert" role="alert">{session.error}</div>}
      <TableTheme><Board cards={snapshot.board} pot={snapshot.pot} distribution={snapshot.distribution} />
        <div className={`game-seats game-seats-${snapshot.seats.length}`}>{snapshot.seats.map(player => <PlayerSeat key={player.accountId} player={player} profile={profiles[player.accountId]}
          isYou={player.accountId === snapshot.accountId} active={player.seatIndex === snapshot.actorSeat} dealer={player.seatIndex === snapshot.dealerSeat}
          smallBlind={player.seatIndex === snapshot.smallBlindSeat} bigBlind={player.seatIndex === snapshot.bigBlindSeat} winner={winners.includes(player.seatIndex)} />)}</div>
      </TableTheme>
      <div className="game-bottom"><section className="game-chat-slot" aria-label="Table chat">{ChatPanel ? <ChatPanel conversationId={snapshot.matchId} /> : <><span className="game-eyebrow">TABLE CHAT</span><p>Chat will appear when the table conversation is ready.</p></>}</section>
        <div><p className="game-turn-caption" role="status">{session.pending ? 'Sending your action…' : snapshot.street === 'HAND_FINISHED' ? 'Hand complete. Next hand starts shortly.' : snapshot.legalActions.length ? 'Your move. Make it count.' : 'Waiting for the next action.'}</p>
          <ActionDock key={snapshot.actionSequence} legalActions={snapshot.legalActions} callAmount={snapshot.callAmount} minRaiseTo={snapshot.minRaiseTo} maxRaiseTo={snapshot.maxRaiseTo} pot={snapshot.pot}
            disabled={session.pending || session.connection !== 'connected'} onAction={session.send} /></div>
      </div>
      {finished && <MatchResult mode={snapshot.mode} placements={snapshot.placements} accountId={snapshot.accountId} profiles={profiles} rewards={runtime.rewards} onExit={() => navigate('/lobby')} />}
    </main>}
    <footer className="game-footer"><span>NO-LIMIT TEXAS HOLD’EM</span><span>Table chips stay in this match.</span></footer>
  </div>
}
