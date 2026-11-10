import { VictoryEffect } from '@/shared/skin'
import { Button, Icon } from '@/shared/ui'
import styles from './CompleteDialog.module.css'

// Shown once the completion is saved. rewarded: this completion paid the coins (true), an earlier one did (false),
// or the status could not be read (null).
export default function CompleteDialog({ rewarded, coins, onRanked, onLobby, onReplay }) {
  return <div className={styles.backdrop}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="complete-title">
    <VictoryEffect>
      <div className={styles.emblem} aria-hidden="true"><Icon name="school" filled /></div>
      <h1 id="complete-title" className={styles.title}>You’re ready for a real table.</h1>
    </VictoryEffect>
    <p className={styles.reward}>{rewarded === false ? 'You already claimed the tutorial reward, so no coins this time.'
      : rewarded ? <><Icon name="toll" />+{coins.toLocaleString()} coins are being added to your wallet.</>
        : `The ${coins.toLocaleString()}-coin tutorial reward is paid once per account.`}</p>
    <div className={styles.actions}>
      <Button onClick={onReplay}>Play again</Button>
      <Button onClick={onLobby}>Back to lobby</Button>
      <Button variant="primary" autoFocus onClick={onRanked}>Play ranked</Button>
    </div>
  </section></div>
}
