import { useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { devIdentity } from '@/shared/lib/devIdentity'
import { Button, Eyebrow, Icon, useConfirm, useToast } from '@/shared/ui'
import { closeSeason, createSeason, updateSeasonRewards } from './api/adminSeasonApi'
import Message from './components/Message'
import Panel from './components/Panel'
import RewardEditor from './components/RewardEditor'
import SeasonForm from './components/SeasonForm'
import SeasonList from './components/SeasonList'
import SectionState from './components/SectionState'
import { statusLabels } from './format'
import { useAdminSeasons } from './hooks/useAdminSeasons'
import { useProducts } from './hooks/useProducts'
import styles from './AdminSeasonsPage.module.css'

export default function AdminSeasonsPage() {
  const navigate = useNavigate()
  const notify = useToast()
  const confirm = useConfirm()
  const devUser = devIdentity()
  const [attempt, setAttempt] = useState(0)
  const state = useAdminSeasons({ devUser, attempt })
  const products = useProducts(devUser)
  const [selectedId, setSelectedId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [closing, setClosing] = useState(false)
  const [closeError, setCloseError] = useState('')
  const reload = () => setAttempt(value => value + 1)

  const { seasons } = state
  const selected = seasons.find(season => season.id === selectedId) || seasons.find(season => season.status === 'ACTIVE') || seasons[0]
  const next = seasons.filter(season => season.status === 'UPCOMING').sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))[0]

  const save = async rewards => {
    await updateSeasonRewards(selected.id, rewards, { devUser })
    notify(`${selected.name} rewards saved.`)
    reload()
  }
  const create = async season => {
    const created = await createSeason(season, { devUser })
    notify(`${created.name} created. It starts when the current season closes.`)
    setCreating(false)
    setSelectedId(created.id)
    reload()
  }
  const close = async season => {
    if (!await confirm({
      title: `Close ${season.name} now?`, icon: 'event_busy', danger: true, confirmLabel: 'Close season', cancelLabel: 'Keep it running',
      message: `Final tiers are recorded from the leaderboard, players keep ${season.resetPercent}% of their Elo and ${next.name} starts at once. This cannot be undone.`,
    })) return
    setClosing(true)
    setCloseError('')
    try {
      await closeSeason({ devUser })
      notify(`${season.name} closed. ${next.name} is now active and rewards can be claimed.`)
      reload()
    } catch (failure) {
      setCloseError(failure.message)
    } finally { setClosing(false) }
  }

  return <div className={styles.page}>
    <header className={styles.header}>
      <div className={styles.intro}>
        <Eyebrow>RANKED ADMINISTRATION</Eyebrow>
        <h1 className={styles.title}>Seasons</h1>
        <p className={styles.muted}>Plan the next season and the rewards of each tier. A season closes by itself once its end date has
          passed and a next season exists: final tiers are recorded, Elo is reset and players can claim their rewards.</p>
      </div>
      <div className={styles.actions}>
        <Button onClick={() => navigate(paths.adminTournaments)}><Icon name="emoji_events" />Tournaments</Button>
        <Button variant="primary" disabled={creating || state.phase === 'loading'} onClick={() => setCreating(true)}><Icon name="add" />New season</Button>
      </div>
    </header>

    {state.phase === 'loading' && <Panel><SectionState kind="loading" message="Loading seasons…" /></Panel>}
    {state.phase === 'error' && <Panel><SectionState kind="error" message={state.error} actionLabel="Try again" onAction={reload} /></Panel>}
    {(state.phase === 'ready' || state.phase === 'refreshing') && <div className={styles.grid}>
      <Panel aria-labelledby="seasons-title">
        <h2 id="seasons-title" className={styles.sectionTitle}>All seasons</h2>
        {closeError && <Message tone="error">{closeError}</Message>}
        {seasons.length > 0
          ? <SeasonList seasons={seasons} selectedId={selected?.id} next={next} closing={closing}
            onSelect={id => { setSelectedId(id); setCreating(false) }} onClose={close} />
          : <p className={styles.muted}>No seasons yet.</p>}
      </Panel>
      <Panel aria-labelledby="editor-title">
        {creating
          ? <><h2 id="editor-title" className={styles.sectionTitle}>New season</h2>
            <SeasonForm seasons={seasons} onCreate={create} onCancel={() => setCreating(false)} /></>
          : selected
            ? <><header>
              <Eyebrow>{statusLabels[selected.status].toUpperCase()} SEASON</Eyebrow>
              <h2 id="editor-title" className={styles.sectionTitle}>{selected.name} · tier rewards</h2>
              <p className={styles.muted}>Rewards add up: a player who finishes in Diamond receives every reward up to Diamond.</p>
            </header>
            {/* The editor restarts from the server's copy whenever the stored rewards change. */}
            <RewardEditor key={`${selected.id}:${JSON.stringify(selected.rewards)}`} season={selected} products={products} onSave={save} /></>
            : <SectionState kind="empty" icon="calendar_month" title="No seasons yet" message="Create the first season to start ranked play."
              actionLabel="New season" onAction={() => setCreating(true)} />}
      </Panel>
    </div>}
  </div>
}
