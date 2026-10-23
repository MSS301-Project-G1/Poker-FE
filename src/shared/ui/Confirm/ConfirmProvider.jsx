import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { ConfirmContext } from './ConfirmContext'
import styles from './Confirm.module.css'

export default function ConfirmProvider({ children }) {
  const [question, setQuestion] = useState(null)
  const answer = useRef(null)

  // A new question replaces one still on screen, which counts as cancelled.
  const confirm = useCallback(options => {
    answer.current?.(false)
    return new Promise(resolve => {
      answer.current = resolve
      setQuestion(options)
    })
  }, [])
  const settle = useCallback(confirmed => {
    answer.current?.(confirmed)
    answer.current = null
    setQuestion(null)
  }, [])

  // A question belongs to the screen that asked it. Leaving that screen, e.g. when a found match opens the table,
  // drops it unanswered: the caller never gets a yes, and the next question answers it no.
  const { pathname } = useLocation()
  const [screen, setScreen] = useState(pathname)
  if (screen !== pathname) {
    setScreen(pathname)
    setQuestion(null)
  }

  return <ConfirmContext.Provider value={confirm}>
    {children}
    {question && <ConfirmDialog {...question} onAnswer={settle} />}
  </ConfirmContext.Provider>
}

// A native modal <dialog>: the browser keeps focus inside it and makes the page behind it inert.
function ConfirmDialog({ title, message, confirmLabel, cancelLabel = 'Hủy', icon, danger = false, onAnswer }) {
  const dialog = useRef(null)
  const [opener] = useState(() => document.activeElement)
  useEffect(() => {
    if (!dialog.current.open) dialog.current.showModal()
    return () => opener?.focus()
  }, [opener])

  // Escape closes the dialog natively (onClose). Keys stop here so panels underneath, like the community dock, ignore them.
  return <dialog ref={dialog} role="alertdialog" aria-labelledby="confirm-title" aria-describedby={message ? 'confirm-message' : undefined}
    className={`${styles.dialog} ${danger ? styles.danger : ''}`}
    onClose={() => onAnswer(false)}
    onKeyDown={event => event.stopPropagation()}
    onClick={event => { if (event.target === event.currentTarget) onAnswer(false) }}>
    <div className={styles.panel}>
      <span className={styles.emblem}><Icon name={icon || (danger ? 'warning' : 'help')} /></span>
      <h2 id="confirm-title" className={styles.title}>{title}</h2>
      {message && <p id="confirm-message" className={styles.message}>{message}</p>}
      <div className={styles.actions}>
        <Button onClick={() => onAnswer(false)}>{cancelLabel}</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={() => onAnswer(true)}>{confirmLabel}</Button>
      </div>
    </div>
  </dialog>
}
