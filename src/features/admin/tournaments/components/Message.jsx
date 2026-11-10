import styles from './Message.module.css'

const roles = { error: 'alert', success: 'status', notice: 'status' }

// Short inline message: errors are announced immediately, the rest politely.
export default function Message({ tone = 'notice', children }) {
  return <p className={`${styles.message} ${styles[tone]}`} role={roles[tone]}>{children}</p>
}
