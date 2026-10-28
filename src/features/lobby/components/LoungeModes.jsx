import { useEffect, useRef, useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { gatewayRequest } from '@/shared/api/gatewayClient'
import { useAuth } from '@/features/auth'
import { useQueue } from '@/features/ranked'
import { pointerTilt } from '@/shared/ui/pointerTilt'
import styles from './LoungeModes.module.css'

export default function LoungeModes() {
  const { active, activeMode, inMatch, queue, start, open, pending, error: queueError, returnToTable, leaveMatch } = useQueue()
  const { user } = useAuth()
  const [state, setState] = useState({ loading: true, party: null, error: '' })
  const [expanded, setExpanded] = useState(false)
  const picker = useRef(null)
  const trigger = useRef(null)
  const closeTimer = useRef(null)
  useEffect(() => {
    const dismiss = event => { if (!picker.current?.contains(event.target)) setExpanded(false) }
    document.addEventListener('pointerdown', dismiss)
    return () => { document.removeEventListener('pointerdown', dismiss); clearTimeout(closeTimer.current) }
  }, [])
  const showModes = () => { clearTimeout(closeTimer.current); setExpanded(true) }
  const closeModes = () => { setExpanded(false); trigger.current?.focus() }
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
  return <section aria-label="Chế độ chơi" className={styles.section}>
    {state.error && <p className={styles.error} role="alert">{state.error} <button type="button" onClick={() => setAttempt(value => value + 1)}>Thử lại</button></p>}
    {inMatch ? <div className={styles.resume}><span className={styles.pulse} /><div><h2>Bạn đang trong một ván đấu</h2><p>{activeMode === 'NORMAL' ? 'Chơi thường' : 'Đấu hạng'} · Ván đấu vẫn đang diễn ra</p>{queueError && <p className={styles.error} role="alert">{queueError}</p>}</div><span className={styles.resumeActions}><Button variant="primary" onClick={returnToTable}>Quay lại bàn</Button>{activeMode === 'NORMAL' && <Button disabled={pending} onClick={leaveMatch}>Rời ván</Button>}</span></div>
      : active ? <div className={styles.resume}><span className={styles.pulse} /><div><h2>Bạn đang trong hàng chờ</h2><p>{activeMode === 'NORMAL' ? 'Chơi thường' : 'Đấu hạng'} · {queue?.playerCount != null ? `${queue.playerCount}/${queue.maxPlayers || 6} người` : 'Đang ghép bàn'}</p></div><Button variant="primary" onClick={() => open(activeMode)}>Quay lại tìm trận</Button></div> : <div ref={picker} className={styles.picker}
      onPointerLeave={event => { if (event.pointerType === 'mouse' && !picker.current?.contains(document.activeElement)) closeTimer.current = setTimeout(() => setExpanded(false), 220) }}
      onPointerEnter={() => clearTimeout(closeTimer.current)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false) }}
      onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); closeModes() } }}>
      <button ref={trigger} type="button" className={styles.trigger} {...pointerTilt}
        aria-expanded={expanded} aria-controls="lobby-mode-options" aria-label="Chơi Poker"
        onPointerEnter={event => { pointerTilt.onPointerEnter(event); if (event.pointerType === 'mouse') showModes() }}
        onClick={event => { clearTimeout(closeTimer.current); setExpanded(event.pointerType === 'mouse' ? true : !expanded) }}>
        <span className={styles.triggerHead}><span className={styles.triggerIcon}><Icon name="playing_cards" /></span><span className={styles.eyebrow}>POKER TABLES</span><Icon name="expand_more" /></span>
        <strong className={styles.triggerTitle}>Chơi Poker</strong>
        <span className={styles.triggerDescription}>Một ván bài. Hai cách chinh phục.</span>
        <span className={styles.triggerFooter}><span><i /> Đấu hạng <b>/</b> <i /> Chơi thường</span><span>Chọn chế độ ↗</span></span>
      </button>
      <div id="lobby-mode-options" className={styles.popover} hidden={!expanded} role="region" aria-label="Chọn chế độ chơi">
        <div className={styles.popoverHead}><span>CHỌN CHẾ ĐỘ</span><button type="button" aria-label="Đóng chọn chế độ" onClick={closeModes}><Icon name="close" /></button></div>
        <div className={styles.grid}>
      <article className={`${styles.card} ${styles.rank}`} {...pointerTilt}>
        <header className={styles.cardHead}>
          <div className={styles.cubeBadge} aria-hidden="true">
            <div className={styles.cube3dMesh}>
              <div className={`${styles.cubeFace} ${styles.faceFront}`} />
              <div className={`${styles.cubeFace} ${styles.faceBack}`} />
              <div className={`${styles.cubeFace} ${styles.faceRight}`} />
              <div className={`${styles.cubeFace} ${styles.faceLeft}`} />
              <div className={`${styles.cubeFace} ${styles.faceTop}`} />
              <div className={`${styles.cubeFace} ${styles.faceBottom}`} />
              <div className={styles.cubeCoreOrb} />
              <div className={styles.cubeIconOverlay}><Icon name="workspace_premium" /></div>
            </div>
          </div>
          <div className={styles.cardTitle}><span className={styles.eyebrow}>RANKED POKER</span><h2>Đấu hạng</h2></div>
        </header>
        <p className={styles.tagline}>Thử sức ở bàn đấu xếp hạng · Chơi đơn</p>
        <div className={styles.metaRow}>
          <span>Ghép theo rank</span>
          <span className={styles.dot}>•</span>
          <span>Xác nhận khi tìm thấy trận</span>
        </div>
        <Button variant="primary" disabled={pending || state.loading || Boolean(state.error) || Boolean(state.party)} onClick={() => start('RANK')}><Icon name="swords" />Tìm trận Rank</Button>
        {state.party && <small>Rời nhóm để tham gia đấu hạng.</small>}
      </article>
      <article className={styles.card} {...pointerTilt}>
        <header className={styles.cardHead}>
          <div className={styles.cubeBadge} aria-hidden="true">
            <div className={styles.cube3dMesh}>
              <div className={`${styles.cubeFace} ${styles.faceFront}`} />
              <div className={`${styles.cubeFace} ${styles.faceBack}`} />
              <div className={`${styles.cubeFace} ${styles.faceRight}`} />
              <div className={`${styles.cubeFace} ${styles.faceLeft}`} />
              <div className={`${styles.cubeFace} ${styles.faceTop}`} />
              <div className={`${styles.cubeFace} ${styles.faceBottom}`} />
              <div className={styles.cubeCoreOrb} />
              <div className={styles.cubeIconOverlay}><Icon name="casino" /></div>
            </div>
          </div>
          <div className={styles.cardTitle}><span className={styles.eyebrow}>CASUAL TABLES</span><h2>Chơi thường</h2></div>
        </header>
        <p className={styles.tagline}>Thư giãn một ván poker · Vào bàn nhanh</p>
        <div className={styles.metaRow}>
          <span>Xác nhận khi tìm thấy trận</span>
          <span className={styles.dot}>•</span>
          <span>Không tính điểm rank</span>
        </div>
        <Button variant="primary" disabled={pending || state.loading || Boolean(state.error) || Boolean(state.party && state.party.leaderId !== user?.accountId)} onClick={() => start('NORMAL')}><Icon name="play_arrow" />{state.party ? 'Cả nhóm chơi nhanh' : 'Chơi nhanh'}</Button>
        {state.party && state.party.leaderId !== user?.accountId && <small>Chờ trưởng nhóm bắt đầu tìm trận.</small>}
      </article>
        </div>
      </div>
    </div>}
  </section>
}
