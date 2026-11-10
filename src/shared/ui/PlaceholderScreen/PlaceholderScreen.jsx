import styles from './PlaceholderScreen.module.css'

// Full-screen message for sections that are not built yet and for missing pages.
export default function PlaceholderScreen({ title, message = 'Coming soon.', children }) {
  return <div className={styles.screen}>
    <h1 className={styles.title}>{title}</h1>
    <p>{message}</p>
    {children}
  </div>
}
