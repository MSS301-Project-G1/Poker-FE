import { useCallback, useEffect, useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { gatewayRequest } from '@/shared/api/gatewayClient'
import { useCommunity } from '../CommunityContext'
import { communityApi as api } from '../api/communityApi'
import { useResource } from '../hooks/useResource'
import { Avatar, Empty, ErrorNotice, Name } from './CommunityUI'
import styles from '../Community.module.css'

const partyCodePattern = /^[A-Z0-9]{8}$/
const partyPasswordPattern = /^\d{6}$/

export default function PartyPanel() {
  const { user, loadProfiles } = useCommunity()
  const loader = useCallback(async signal => {
    const [party, queue] = await Promise.all([api.party(signal), apiQueue(signal)])
    return { party: party?.partyId ? party : null, queue }
  }, [])
  const { data, loading, error, reload } = useResource(loader, 5000)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState('')
  const [message, setMessage] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const canJoin = partyCodePattern.test(code) && partyPasswordPattern.test(password)
  const party = data?.party
  const leader = party?.leaderId === user?.accountId
  const locked = Boolean(data?.queue?.status && !['NONE', 'FAILED'].includes(data.queue.status))
  useEffect(() => { if (party) void loadProfiles(party.memberIds) }, [party, loadProfiles])

  async function run(operation, success) {
    if (busy) return
    setBusy(true); setFailure(''); setMessage('')
    try { await operation(); setMessage(success); reload() } catch (failure) { setFailure(failure.message) } finally { setBusy(false) }
  }
  return <section className={styles.card} aria-labelledby="party-title">
    <header className={styles.cardHead}>
      <div className="flex items-center gap-space-sm min-w-0">
        <div className={styles.cubeBadge} aria-hidden="true">
          <div className={styles.cube3dMesh}>
            <div className={`${styles.cubeFace} ${styles.faceFront}`} />
            <div className={`${styles.cubeFace} ${styles.faceBack}`} />
            <div className={`${styles.cubeFace} ${styles.faceRight}`} />
            <div className={`${styles.cubeFace} ${styles.faceLeft}`} />
            <div className={`${styles.cubeFace} ${styles.faceTop}`} />
            <div className={`${styles.cubeFace} ${styles.faceBottom}`} />
            <div className={styles.cubeCoreOrb} />
            <div className={styles.cubeIconOverlay}><Icon name="groups" /></div>
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-bold tracking-widest text-pink-400">TEAM LOUNGE</span>
          <h2 id="party-title" className="text-[20px] font-bold leading-tight">Nhóm chơi</h2>
        </div>
      </div>
      {party && <span className={styles.muted}>{party.memberIds.length} thành viên</span>}
    </header>
    <ErrorNotice message={error || failure} retry={error ? reload : null} />
    {message && <p className={styles.success} role="status">{message}</p>}
    {loading ? <Empty>Đang kiểm tra nhóm…</Empty> : !data ? null : !party ? <div className={styles.partyActions}>
      <p className={styles.tagline}>Rủ bạn bè cùng chơi · Cùng nhóm cùng vui</p>
      <Button variant="primary" className={styles.createBtn} disabled={busy || locked} onClick={() => run(api.createParty, 'Đã tạo nhóm.')}><Icon name="group_add" />Tạo nhóm</Button>
      <form className={styles.form} onSubmit={event => { event.preventDefault(); if (canJoin) void run(() => api.joinParty(code, password), 'Đã tham gia nhóm.') }}>
        <div className={styles.joinRow}>
          <label htmlFor="party-code" className={styles.srOnly}>Tham gia bằng mã nhóm</label>
          <input id="party-code" className={styles.compactInput} value={code} autoComplete="off" placeholder="8 ký tự, ví dụ AB12CD34" onChange={event => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))} />
          <label htmlFor="party-password" className={styles.srOnly}>Mật khẩu</label>
          <input id="party-password" className={styles.compactPassword} value={password} inputMode="numeric" autoComplete="off" placeholder="6 chữ số" onChange={event => setPassword(event.target.value.replace(/\D/g, '').slice(0, 6))} />
          <Button type="submit" className={styles.joinBtn} disabled={busy || locked || !canJoin}>Vào nhóm</Button>
        </div>
      </form>
    </div> : <>
      <div className={styles.partyCode}><span className={styles.muted}>Mã nhóm</span><code>{party.partyCode}</code><button type="button" className={styles.iconButton} aria-label="Sao chép mã nhóm" onClick={() => run(() => navigator.clipboard.writeText(party.partyCode), 'Đã sao chép mã nhóm.')}><Icon name="content_copy" /></button></div>
      {party.password && <div className={styles.partyCode}><span className={styles.muted}>Mật khẩu</span><code>{party.password}</code><button type="button" className={styles.iconButton} aria-label="Sao chép mật khẩu nhóm" onClick={() => run(() => navigator.clipboard.writeText(party.password), 'Đã sao chép mật khẩu nhóm.')}><Icon name="content_copy" /></button></div>}
      <p className={styles.hint}><Icon name="share" />Gửi mã và mật khẩu cho bạn bè để họ vào nhóm.</p>
      {locked && <p className={styles.hint}><Icon name="lock" />Nhóm đang tìm trận — tạm khóa thành viên.</p>}
      <ul className={styles.list}>{party.memberIds.map(id => <li className={styles.row} key={id}><Avatar id={id} /><span className={styles.person}><strong><Name id={id} /></strong>{id === user?.accountId && <small className={styles.muted}>Bạn</small>}</span>{id === party.leaderId && <span className={styles.leader} title="Trưởng nhóm"><Icon name="crown" /></span>}{leader && id !== user?.accountId && <button className={styles.iconButton} type="button" aria-label="Mời thành viên rời nhóm" disabled={busy || locked} onClick={() => { if (window.confirm('Mời người chơi này rời nhóm?')) void run(() => api.kick(id), 'Đã mời người chơi rời nhóm. Mật khẩu nhóm đã được đổi.') }}><Icon name="person_remove" /></button>}</li>)}</ul>
      <Button className={styles.full} disabled={busy || locked} onClick={() => { if (window.confirm('Bạn muốn rời nhóm?')) void run(api.leaveParty, 'Đã rời nhóm.') }}>Rời nhóm</Button>
    </>}
  </section>
}

// Keep queue authentication on the same gateway client as existing matchmaking.
const apiQueue = signal => gatewayRequest('/api/matchmaking/normal/status', { signal })
