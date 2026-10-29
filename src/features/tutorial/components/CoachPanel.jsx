import { Button, Eyebrow, Icon } from '@/shared/ui'
import styles from './CoachPanel.module.css'

// The coach for the current step: what happened, what to learn, and either the button to press or Continue.
export default function CoachPanel({ step, index, total, busy, error, onContinue }) {
  return <section className={styles.coach} aria-labelledby="coach-title" aria-live="polite">
    <header className={styles.header}>
      <Eyebrow>HƯỚNG DẪN · BƯỚC {index + 1}/{total}</Eyebrow>
      <span className={styles.progress} aria-hidden="true"><i style={{ width: `${((index + 1) / total) * 100}%` }} /></span>
    </header>
    <h2 id="coach-title" className={styles.title}>{step.title}</h2>
    <p className={styles.text}>{step.text}</p>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {step.expect
      ? <p className={styles.hint}><Icon name="touch_app" className={styles.hintIcon} />Bấm <strong>{step.expect}</strong> ở bảng thao tác.</p>
      : <Button variant="primary" className={styles.next} disabled={busy} onClick={onContinue}>
        {step.final ? (busy ? 'Đang lưu…' : 'Hoàn thành') : 'Tiếp tục'}<Icon name={step.final ? 'check' : 'arrow_forward'} />
      </Button>}
  </section>
}
