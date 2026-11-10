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
      setCopyNotice('Player code copied.')
    } catch {
      setCopyNotice('Couldn’t copy. You can select and copy the code above.')
    }
  }

  return <section className={ui.finder} aria-label="Find players">
    <div className={ui.identity}>
      <div className={ui.identityText}>
        <span>Your player code</span>
        <strong>{own.data?.playerCode || (own.loading ? 'Loading…' : 'Couldn’t load')}</strong>
      </div>
      <Button disabled={!own.data?.playerCode} onClick={copyCode}>Copy code</Button>
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
      <label htmlFor="find-player">Find a player</label>
      <div className={ui.searchControls}>
        <input id="find-player" placeholder="Enter a name or player code" minLength={2} maxLength={100} required value={query} onChange={event => setQuery(event.target.value)} />
        <Button type="submit" disabled={query.trim().length < 2}>Search</Button>
      </div>
      <p className={ui.feedback}>Use a player code to find someone exactly.</p>
    </form>
    <ErrorNotice message={search.error} retry={search.reload} />
    {submitted && search.loading && <p role="status">Searching players…</p>}
    {search.data && <>
      <p className={ui.feedback} role="status">{search.data.length ? `Results for “${submitted}” (up to 20):` : `No players found for “${submitted}”.`}</p>
      <ul className={ui.list}>{search.data.map(player => <li className={ui.personRow} key={player.accountId}>
          <img className={styles.avatar} src={player.avatarUrl || '/stitch-assets/avatar.svg'} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/stitch-assets/avatar.svg' }} />
          <span className={ui.person}><strong>{player.displayName || 'Player'}</strong><small>{player.playerCode}</small></span>
        <div className={ui.actions}><Button disabled={busy || sent.includes(player.accountId)} onClick={() => run(async () => {
          await api.addFriend(player.accountId)
          setSent(current => [...current, player.accountId])
        }, `Request to ${player.displayName || player.playerCode} handled. Check your friends or sent requests.`)}>{sent.includes(player.accountId) ? 'Request sent' : 'Add friend'}</Button></div>
      </li>)}</ul>
    </>}
  </section>
}
