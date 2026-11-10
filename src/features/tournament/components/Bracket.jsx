import BracketTable from './BracketTable'
import SectionState from './SectionState'
import styles from './Bracket.module.css'

// Final table first, then the qualifiers. The final is drawn once every qualifier has finished.
export default function Bracket({ tournament, profiles, accountId, onOpenTable }) {
  const { status, tables, entries } = tournament
  if (!tables.length) return status === 'CANCELLED'
    ? <SectionState kind="empty" icon="event_busy" title="No draw" message="The tournament was cancelled before the tables were drawn." />
    : <SectionState kind="empty" icon="casino" title="The draw happens at the start"
      message="Players are shuffled across tables of eight. The top two of each table meet in the final; eight players or fewer go straight to the final." />

  const entriesById = Object.fromEntries(entries.map(entry => [entry.accountId, entry]))
  const final = tables.find(table => table.round === 'FINAL')
  const qualifiers = tables.filter(table => table.round === 'QUALIFIER')
  const table = item => <BracketTable key={item.id} table={item} entriesById={entriesById} profiles={profiles}
    accountId={accountId} onOpenTable={onOpenTable} />

  return <div className={styles.bracket}>
    {final ? table(final) : <div className={styles.waiting}>Final · the top two of each qualifier table</div>}
    {qualifiers.length > 0 && <>
      <h3 className={styles.round}>Qualifiers</h3>
      <div className={styles.grid}>{qualifiers.map(table)}</div>
    </>}
  </div>
}
