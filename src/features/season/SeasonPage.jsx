import { useState } from 'react'
import { useNavigate } from 'react-router'
import { TierBadge } from '@/features/ranking'
import { paths } from '@/shared/config/paths'
import { devIdentity } from '@/shared/lib/devIdentity'
import { Button, Eyebrow, Icon, useToast } from '@/shared/ui'
import ClaimCard from './components/ClaimCard'
import Panel from './components/Panel'
import RewardLadder from './components/RewardLadder'
import SectionState from './components/SectionState'
import { formatDate } from './format'
import { useMySeasonRewards } from './hooks/useMySeasonRewards'
import { useSeason } from './hooks/useSeason'
import styles from './SeasonPage.module.css'

export default function SeasonPage() {
  const navigate = useNavigate()
  const notify = useToast()
  const devUser = devIdentity()
  const [attempt, setAttempt] = useState(0)
  const current = useSeason({ devUser, attempt })
  const mine = useMySeasonRewards({ devUser, attempt })
  const retry = () => setAttempt(value => value + 1)
  const { season } = current
  const claim = async seasonId => {
    const claimed = await mine.claim(seasonId)
    notify(`${claimed.seasonName} rewards claimed. Coins and skins arrive in your wallet and inventory shortly.`)
  }
  const unclaimed = mine.items.filter(item => !item.claimed).length

  return <div className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.intro}>
        <Eyebrow>{season ? `SEASON · ${current.daysLeft} DAYS LEFT` : 'RANKED SEASON'}</Eyebrow>
        <h1 className={styles.title}>{season?.name || 'Season rewards'}</h1>
        {season && <p className={styles.muted}>{formatDate(season.startAt)} – {formatDate(season.endAt)} · The next season starts
          with {season.resetPercent}% of your final Elo.</p>}
      </div>
      <div className={styles.actions}>
        {current.me && <div className={styles.tier}><span className={styles.label}>Your tier now</span><TierBadge tier={current.me.tier} /></div>}
        <Button onClick={() => navigate(paths.ranking)}><Icon name="leaderboard" />Leaderboard</Button>
      </div>
    </section>

    <div className={styles.columns}>
    <Panel aria-labelledby="ladder-title">
      <header>
        <h2 id="ladder-title" className={styles.sectionTitle}>Tier rewards</h2>
        <p className={styles.muted}>Rewards add up: reaching Diamond earns every reward from Iron to Diamond. They are
          granted for your tier when the season closes, so keep climbing until the last day.</p>
      </header>
      {current.phase === 'loading' && <SectionState kind="loading" message="Loading the season…" />}
      {current.phase === 'error' && <SectionState kind="error" message={current.error} actionLabel="Try again" onAction={retry} />}
      {current.phase === 'none' && <SectionState kind="empty" title="No season is running" message="The next season has not started yet." />}
      {current.phase === 'ready' && <RewardLadder rewards={current.rewards} currentTier={current.me?.tier} />}
    </Panel>

    <div className={styles.side}>
    <Panel className={styles.mine} aria-labelledby="mine-title">
      <header>
        <h2 id="mine-title" className={styles.sectionTitle}>Your season rewards{unclaimed > 0 ? ` · ${unclaimed} to claim` : ''}</h2>
        <p className={styles.muted}>Rewards from ended seasons stay here until you claim them.</p>
      </header>
      {mine.phase === 'loading' && <SectionState kind="loading" message="Loading your rewards…" />}
      {mine.phase === 'error' && <SectionState kind="error" message={mine.error} actionLabel="Try again" onAction={retry} />}
      {mine.phase === 'signed-out' && <SectionState kind="empty" title="Sign in to see your rewards"
        message="Season rewards are tied to your account." />}
      {mine.phase === 'ready' && mine.items.length === 0 && <SectionState kind="empty" title="No rewards yet"
        message="Finish a season in Iron or higher to earn rewards here." />}
      {mine.phase === 'ready' && mine.items.length > 0 && <div className={styles.claims}>
        {mine.items.map(item => <ClaimCard key={item.seasonId} item={item} onClaim={claim} />)}
      </div>}
    </Panel>
    </div>
    </div>
  </div>
}
