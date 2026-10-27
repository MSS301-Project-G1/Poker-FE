import { useCallback, useState } from 'react'
import { Button } from '@/shared/ui'
import { communityApi as api } from '../api/communityApi'
import { useResource } from '../hooks/useResource'
import { ErrorNotice } from './CommunityUI'
import styles from '../Community.module.css'
import ui from './FriendsPanel.module.css'

export default function FindPlayers({ busy, run }) {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [sent, setSent] = useState([])
  const [copyNotice, setCopyNotice] = useState('')
  const ownLoader = useCallback(signal => api.myPlayer(signal), [])
  const own = useResource(ownLoader)
  const searchLoader = useCallback(signal => submitted ? api.searchPlayers(submitted, signal) : Promise.resolve(null), [submitted])
  const search = useResource(searchLoader)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(own.data.playerCode)
      setCopyNotice('Đã sao chép mã người chơi.')
    } catch {
      setCopyNotice('Chưa sao chép được. Bạn có thể chọn và sao chép mã bên trên.')
    }
  }

  return <section className={ui.finder} aria-label="Tìm và kết bạn">
    <div className={ui.identity}>
      <div className={ui.identityText}>
        <span>Mã người chơi của bạn</span>
        <strong>{own.data?.playerCode || (own.loading ? 'Đang tải…' : 'Chưa tải được')}</strong>
      </div>
      <Button disabled={!own.data?.playerCode} onClick={copyCode}>Sao chép mã</Button>
    </div>
    {copyNotice && <p className={ui.feedback} role="status">{copyNotice}</p>}
    <ErrorNotice message={own.error} retry={own.reload} />
    <form className={ui.search} onSubmit={event => {
      event.preventDefault()
      if (query.trim().length >= 2) {
        if (submitted === query.trim()) search.reload()
        else setSubmitted(query.trim())
      }
    }}>
      <label htmlFor="find-player">Kết nối với người chơi</label>
      <div className={ui.searchControls}>
        <input id="find-player" placeholder="Nhập tên hoặc mã người chơi" minLength={2} maxLength={100} required value={query} onChange={event => setQuery(event.target.value)} />
        <Button type="submit" disabled={query.trim().length < 2}>Tìm kiếm</Button>
      </div>
      <p className={ui.feedback}>Dùng mã người chơi để tìm chính xác bạn bè.</p>
    </form>
    <ErrorNotice message={search.error} retry={search.reload} />
    {submitted && search.loading && <p role="status">Đang tìm người chơi…</p>}
    {search.data && <>
      <p className={ui.feedback} role="status">{search.data.length ? `Kết quả cho “${submitted}” (tối đa 20 người):` : `Không tìm thấy người chơi với “${submitted}”.`}</p>
      <ul className={ui.list}>{search.data.map(player => <li className={ui.personRow} key={player.accountId}>
          <img className={styles.avatar} src={player.avatarUrl || '/stitch-assets/avatar.svg'} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/stitch-assets/avatar.svg' }} />
          <span className={ui.person}><strong>{player.displayName || 'Người chơi'}</strong><small>{player.playerCode}</small></span>
        <div className={ui.actions}><Button disabled={busy || sent.includes(player.accountId)} onClick={() => run(async () => {
          await api.addFriend(player.accountId)
          setSent(current => [...current, player.accountId])
        }, `Đã xử lý lời mời với ${player.displayName || player.playerCode}. Kiểm tra danh sách bạn bè hoặc lời mời đã gửi.`)}>{sent.includes(player.accountId) ? 'Đã gửi lời mời' : 'Thêm bạn'}</Button></div>
      </li>)}</ul>
    </>}
  </section>
}
