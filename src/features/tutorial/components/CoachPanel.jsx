import { Button, Caption, Icon } from '@/shared/ui'
import styles from './CoachPanel.module.css'

// The coach for the current step: what happened, what to learn, and either the button to press or Continue.
export default function CoachPanel({ step, index, total, busy, error, onContinue }) {
  return <section className={styles.coach} aria-labelledby="coach-title" aria-live="polite">
    <header className={styles.header}>
      <Caption>Step {index + 1}/{total}</Caption>
      <span className={styles.progress} aria-hidden="true"><i style={{ width: `${((index + 1) / total) * 100}%` }} /></span>
    </header>
    <h2 id="coach-title" className={styles.title}>{step.title}</h2>
    <p className={styles.text}>{step.text}</p>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {step.expect
      ? <p className={styles.hint}><Icon name="touch_app" className={styles.hintIcon} />Press <strong>{step.expect}</strong> in the action bar.</p>
      : <Button variant="primary" className={styles.next} disabled={busy} onClick={onContinue}>
        {step.final ? (busy ? 'Saving…' : 'Finish') : 'Continue'}<Icon name={step.final ? 'check' : 'arrow_forward'} />
      </Button>}
  </section>
}
