// Public API of the game-table feature. Other code imports only from here.
export { default as GameTablePage } from './GameTablePage'
// Prop-driven table components, reusable by the Tutorial feature.
export { default as Board } from './components/Board'
export { default as PlayerSeat } from './components/PlayerSeat'
export { default as ActionDock } from './components/ActionDock'
export { default as TurnTimer } from './components/TurnTimer'
export { default as MatchResult } from './components/MatchResult'
export { default as HandGuide } from './components/HandGuide'
export { GameRuntimeContext } from './runtime'
export { leaveTable, confirmLeaveMatch } from './api/gameApi'
