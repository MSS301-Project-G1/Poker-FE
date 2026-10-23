import { Eyebrow, Icon } from '@/shared/ui'
import { formatCoins, placeLabel } from '../format'
import Panel from './Panel'
import styles from './PrizePanel.module.css'

// Prize pool and the coins of final places 1–3, as the server calculates them for the current field.
export default function PrizePanel({ tournament }) {
  const { type, entryFee, rewardCoins, rewardProductId, prizePool, prizes } = tournament
  const grows = type === 'OPEN' && entryFee > 0
  return <Panel as="aside" aria-labelledby="prize-title">
    <header className={styles.header}>
      <Eyebrow>PRIZE POOL</Eyebrow>
      <h2 id="prize-title" className={styles.pool}>{formatCoins(prizePool)}</h2>
      <p className={styles.muted}>
        {grows ? `Grows by ${formatCoins(entryFee)} with every player${rewardCoins > 0 ? `, on top of a ${formatCoins(rewardCoins)} bonus` : ''}. ` : ''}
        The top three of the final share it.
      </p>
    </header>
    <ol className={styles.places}>
      {prizes.map((coins, index) => <li key={index} className={`${styles.place} ${index === 0 ? styles.champion : ''}`}>
        <span className={styles.rank}>{index === 0 && <Icon name="emoji_events" className={styles.trophy} />}{placeLabel(index + 1)}</span>
        <strong>{formatCoins(coins)}</strong>
      </li>)}
    </ol>
    {rewardProductId && <p className={styles.skin}><Icon name="auto_awesome" className={styles.skinIcon} />The champion also wins an exclusive skin.</p>}
  </Panel>
}
