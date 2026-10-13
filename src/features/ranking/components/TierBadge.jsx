import { tiers } from '../tiers'

export default function TierBadge({ tier }) {
  const info = tiers[tier] || { label: tier || 'Unranked', color: '#a28a98' }
  return <span className="ranking-tier" style={{ '--tier-color': info.color }}>
    <span className="material-symbols-outlined" aria-hidden="true">{tier === 'CARD_GOD' ? 'workspace_premium' : 'military_tech'}</span>{info.label}
  </span>
}
