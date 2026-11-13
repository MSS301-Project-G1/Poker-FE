import { TierBadge } from '@/features/ranking'
import { Button, Icon } from '@/shared/ui'
import { dateTime, errorMessage, fieldGridClass, titleCase } from '../format'
import DetailField from './DetailField'
import DetailSection from './DetailSection'

const streak = standing => standing.winStreak ? `${standing.winStreak} wins` : standing.lossStreak ? `${standing.lossStreak} losses` : 'None'

export default function GameSection({ user, standing, matches, editable, onAdjustElo }) {
  const actions = <Button disabled={!editable || Boolean(standing.error)} onClick={onAdjustElo}><Icon name="tune" />Adjust Elo</Button>
  return <DetailSection title="Game" actions={actions}>
    {standing.error ? <p role="alert">{errorMessage(standing.error)}</p> : <dl className={fieldGridClass}>
      <DetailField label="Tier"><TierBadge tier={standing.data.tier} /></DetailField>
      <DetailField label="Elo">{standing.data.elo} (peak {standing.data.peakElo})</DetailField>
      <DetailField label="Leaderboard position">{standing.data.position ?? 'Not ranked'}</DetailField>
      <DetailField label="Ranked matches this season">{standing.data.matchesPlayed}</DetailField>
      <DetailField label="Streak">{streak(standing.data)}</DetailField>
    </dl>}
    <h3 className="mb-2 mt-6 font-semibold">Recent matches</h3>
    {matches.error ? <p role="alert">{errorMessage(matches.error)}</p>
      : matches.data.content.length === 0 ? <p>No matches yet.</p>
        : <ol className="space-y-2">{matches.data.content.map(match => {
          const placement = match.placements?.find(item => item.accountId === user.accountId)
          return <li key={match.id} className="flex flex-wrap justify-between gap-2 rounded-xl bg-surface-container p-3 text-sm">
            <span>{match.mode} · {placement ? `place ${placement.place}/${match.placements.length}` : titleCase(match.status)}</span>
            <time dateTime={match.startedAt}>{dateTime(match.startedAt)}</time>
          </li>
        })}</ol>}
  </DetailSection>
}
