import { useNavigate, useSearchParams } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Button, Eyebrow, Icon } from '@/shared/ui'
import TournamentList from './components/TournamentList'
import ViewTabs from './components/ViewTabs'
import { useDevUser } from './hooks/useDevUser'
import styles from './TournamentsPage.module.css'

export default function TournamentsPage() {
  const navigate = useNavigate()
  const devUser = useDevUser()
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'past' ? 'past' : 'upcoming'
  // The tab lives in the URL so a shared link opens the same view; other params such as devUser stay.
  const show = next => setParams(current => {
    const updated = new URLSearchParams(current)
    if (next === 'past') updated.set('view', 'past')
    else updated.delete('view')
    return updated
  }, { replace: true })

  return <div className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.intro}>
        <Eyebrow>COMPETITIVE</Eyebrow>
        <h1 className={styles.title}>Tournaments</h1>
        <p className={styles.muted}>Elite tournaments invite the top of the leaderboard; Open tournaments take the first paid
          entries. Tables of eight play the qualifiers and the top two of each table meet in the final.</p>
      </div>
      <Button onClick={() => navigate(paths.ranking)}><Icon name="leaderboard" />Leaderboard</Button>
    </section>

    <ViewTabs view={view} onChange={show} />
    <div id="tournament-panel" role="tabpanel" aria-labelledby={`tournament-tab-${view}`}>
      <TournamentList key={view} past={view === 'past'} devUser={devUser} />
    </div>
  </div>
}
