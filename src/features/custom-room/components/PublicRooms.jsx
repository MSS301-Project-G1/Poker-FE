import { Button, Eyebrow, Icon } from '@/shared/ui'
import Message from './Message'
import Panel from './Panel'
import PublicRoomRow from './PublicRoomRow'
import styles from './PublicRooms.module.css'

export default function PublicRooms({ result, error, page, disabled, onPage, onRefresh, onJoin }) {
  return <Panel className={styles.panel} aria-label="Public rooms">
    <header className={styles.header}>
      <div><Eyebrow>OPEN TABLES</Eyebrow><h2 className={styles.title}>Public rooms</h2></div>
      <Button onClick={onRefresh}><Icon name="refresh" className={styles.icon} /> Refresh</Button>
    </header>
    {error && <Message tone="error">{error}</Message>}
    {!result && !error && <p className={styles.muted} role="status">Loading rooms…</p>}
    {result?.content.length === 0 && <p className={styles.muted}>No public rooms are waiting. Create one and invite your friends.</p>}
    {result?.content.length > 0 && <ul className={styles.list}>
      {result.content.map(room => <PublicRoomRow key={room.id} room={room} disabled={disabled} onJoin={onJoin} />)}
    </ul>}
    {result?.totalPages > 1 && <footer className={styles.pager}>
      <Button disabled={page === 0} onClick={() => onPage(page - 1)}>Previous</Button>
      <span>Page {page + 1} of {result.totalPages}</span>
      <Button disabled={page + 1 >= result.totalPages} onClick={() => onPage(page + 1)}>Next</Button>
    </footer>}
  </Panel>
}
