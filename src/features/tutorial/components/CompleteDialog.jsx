import { VictoryEffect } from '@/shared/skin'
import { Button, Icon } from '@/shared/ui'
import styles from './CompleteDialog.module.css'

// Shown once the completion is saved. rewarded: this completion paid the coins (true), an earlier one did (false),
// or the status could not be read (null).
export default function CompleteDialog({ rewarded, coins, onRanked, onLobby, onReplay }) {
  return <div className={styles.backdrop}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="complete-title">
    <VictoryEffect>
      <div className={styles.emblem} aria-hidden="true"><Icon name="school" filled /></div>
      <p className={styles.eyebrow}>HOÀN THÀNH HƯỚNG DẪN</p>
      <h1 id="complete-title" className={styles.title}>Bạn đã sẵn sàng ngồi bàn thật.</h1>
    </VictoryEffect>
    <p className={styles.reward}>{rewarded === false ? 'Bạn đã nhận thưởng hướng dẫn trước đó, lần này không cộng thêm xu.'
      : rewarded ? <><Icon name="toll" />+{coins.toLocaleString()} xu đang được cộng vào ví của bạn.</>
        : `Thưởng hướng dẫn ${coins.toLocaleString()} xu được trả một lần cho mỗi tài khoản.`}</p>
    <div className={styles.actions}>
      <Button onClick={onReplay}>Chơi lại</Button>
      <Button onClick={onLobby}>Về sảnh</Button>
      <Button variant="primary" autoFocus onClick={onRanked}>Chơi Rank</Button>
    </div>
  </section></div>
}
