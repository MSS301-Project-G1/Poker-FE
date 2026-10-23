import { useEffect, useMemo, useState } from 'react'
import { LiveTableSurface } from '@/features/demo'
import { useCommunity } from '@/features/community'
import { Button } from '@/shared/ui'
import styles from './ProposalTable.module.css'

// This is a preview of the reserved roster, not a game snapshot. No cards or chips are dealt.
export default function ProposalTable({ queue, user, current, state, remaining, mode }) {
  const [renderStatus, setRenderStatus] = useState('loading')
  const { profiles, loadProfiles } = useCommunity()
  const idsKey = (queue.playerIds || []).join(',')
  useEffect(() => { if (idsKey) void loadProfiles(idsKey.split(',')) }, [idsKey, loadProfiles])
  const snapshot = useMemo(() => ({
    tableId: `proposal:${queue.proposalId}`, accountId: user.accountId, handNumber: 0,
    actionSequence: 0, board: [], pot: 0, actorSeat: -1, dealerSeat: -1, street: 'WAITING',
    seats: (idsKey ? idsKey.split(',') : [user.accountId]).map((accountId, seatIndex) => ({
      accountId, seatIndex, chips: 0, streetBet: 0, cards: [], holeCardCount: 0,
      folded: false, eliminated: false, leftEarly: false,
    })),
  }), [queue.proposalId, user.accountId, idsKey])
  const proposed = queue.status === 'PROPOSED'
  return <section className={styles.scene} data-live-table aria-label="Xác nhận trận trên bàn 3D">
    <LiveTableSurface snapshot={snapshot} onStatus={setRenderStatus} />
    <header className={styles.header}>♠ POKER RANK <span>{mode === 'RANK' ? 'ĐẤU HẠNG' : 'CHƠI THƯỜNG'}</span></header>
    {snapshot.seats.map(seat => <div key={seat.accountId} data-seat={seat.seatIndex} className={styles.player}>
      {seat.accountId === user.accountId ? `${user.profile?.displayName || 'Bạn'} (Bạn)` : profiles[seat.accountId]?.displayName || `Người chơi ${seat.accountId.slice(0, 6)}`}
    </div>)}
    <div className={styles.prompt} role="region" aria-label="Xác nhận ghép trận">
      <p>{snapshot.seats.length} NGƯỜI · ĐÃ TÌM THẤY BÀN</p>
      <h1>{proposed ? 'Sẵn sàng vào trận?' : 'Đang chuẩn bị ván đấu…'}</h1>
      {proposed && <p>Xác nhận trong <strong>{remaining ?? 0}s</strong></p>}
      {current.accepted && <p>Đã xác nhận. Đang chờ người chơi còn lại.</p>}
      {current.error && <p role="alert">{current.error}</p>}
      {renderStatus === 'unavailable' && <p>Không tải được bàn 3D. Bạn vẫn có thể xác nhận trận.</p>}
      {proposed && <div className={styles.actions}>
        <Button disabled={state.pending || remaining === 0} onClick={state.decline}>Từ chối</Button>
        <Button variant="primary" disabled={state.pending || current.accepted || remaining === 0} onClick={state.accept}>{current.accepted ? 'Đã xác nhận' : 'Chấp nhận trận'}</Button>
      </div>}
    </div>
    <div className={styles.blackout} aria-hidden="true" />
  </section>
}
