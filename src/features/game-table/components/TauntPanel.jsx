import { useEffect, useState } from 'react'
import { Icon } from '@/shared/ui'
import { TAUNT_COOLDOWN_MILLIS } from '../hooks/useTauntPlayer'
import styles from './TauntPanel.module.css'

/**
 * Header menu: play an owned taunt sound for the whole table, or mute every taunt.
 * The server enforces the cooldown; the buttons only wait it out so a press is never wasted.
 */
export default function TauntPanel({ sounds, disabled, onTaunt, muted, onToggleMute }) {
  const [cooling, setCooling] = useState(false)
  useEffect(() => {
    if (!cooling) return undefined
    const timer = window.setTimeout(() => setCooling(false), TAUNT_COOLDOWN_MILLIS)
    return () => window.clearTimeout(timer)
  }, [cooling])
  function taunt(productId) {
    onTaunt(productId)
    setCooling(true)
  }
  return <details className={styles.panel}>
    <summary><Icon name="campaign" className={styles.icon} /> Âm thanh</summary>
    <div className={styles.popover}>
      <strong>PHÁT CHO CẢ BÀN</strong>
      {sounds.length ? <ul>{sounds.map(sound => <li key={sound.productId}>
        <button type="button" disabled={disabled || cooling} onClick={() => taunt(sound.productId)}>
          {sound.iconUrl ? <img src={sound.iconUrl} alt="" /> : <Icon name="volume_up" />}<span>{sound.name}</span>
        </button></li>)}</ul>
        : <p>Bạn chưa có âm thanh nào. Mua trong Cửa hàng sau trận để phát cho cả bàn nghe.</p>}
      {cooling && <p role="status">Chờ {TAUNT_COOLDOWN_MILLIS / 1000} giây rồi phát tiếp.</p>}
      <label className={styles.mute}><input type="checkbox" checked={muted} onChange={onToggleMute} /> Tắt âm thanh trêu chọc</label>
    </div>
  </details>
}
