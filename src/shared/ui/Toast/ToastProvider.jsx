import { useEffect, useState } from 'react'
import { ToastContext } from './ToastContext'
import styles from './Toast.module.css'

const visibleMs = 4200

export default function ToastProvider({ children }) {
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!message) return undefined
    const timeout = window.setTimeout(() => setMessage(''), visibleMs)
    return () => window.clearTimeout(timeout)
  }, [message])

  return <ToastContext.Provider value={setMessage}>
    {children}
    {message && <div className={styles.toast} role="status">{message}</div>}
  </ToastContext.Provider>
}
