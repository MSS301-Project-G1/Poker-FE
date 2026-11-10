import { Board, PlayerSeat } from '@/features/game-table'
import { TableTheme } from '@/shared/skin'
import { bots, card, seatSlots, YOU } from '../script'
import styles from './TutorialTable.module.css'

const handOver = step => step.street === 'HAND_FINISHED'

/** Seats in the shape the game table's PlayerSeat reads from a live snapshot. */
function seatPlayers(step, accountId) {
  return step.seats.map((seat, index) => ({
    accountId: index === YOU ? accountId : bots[index].id, seatIndex: index, holeCardCount: 2,
    cards: (seat.cards || []).map(card), folded: Boolean(seat.folded), eliminated: false, leftEarly: false,
    lastAction: seat.action || null, place: null, handRank: seat.hand ? { category: seat.hand } : null,
  }))
}

// The felt, board and seats of the game table, drawn from one scripted step instead of a server snapshot.
export default function TutorialTable({ step, accountId, profile, glow }) {
  const profiles = { [accountId]: profile, ...Object.fromEntries(Object.values(bots).map(bot => [bot.id, { displayName: bot.displayName }])) }
  return <TableTheme className={styles.table} glow={glow}>
    <div className={styles.center}>
      <Board cards={step.board.map(card)} pot={step.pot} distribution={step.distribution} street={step.street} result={step.result} />
    </div>
    {seatPlayers(step, accountId).map(player => <PlayerSeat key={player.accountId} player={player} profile={profiles[player.accountId]}
      slot={seatSlots[player.seatIndex]} isYou={player.seatIndex === YOU} active={player.seatIndex === step.actor}
      dealer={player.seatIndex === step.dealer} smallBlind={player.seatIndex === step.smallBlind} bigBlind={player.seatIndex === step.bigBlind}
      winner={player.seatIndex === step.winner} chips={step.seats[player.seatIndex].chips}
      bet={handOver(step) ? 0 : step.seats[player.seatIndex].bet || 0} showHand={handOver(step)} />)}
  </TableTheme>
}
