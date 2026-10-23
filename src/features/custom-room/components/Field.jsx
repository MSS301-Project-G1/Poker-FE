import styles from './Field.module.css'

/** Labelled text input; pass options ([{ value, label }]) to render a select instead. */
export default function Field({ label, hint, options, controlClassName = '', ...control }) {
  const className = `${styles.control} ${controlClassName}`
  return <label className={styles.field}>
    <span>{label}{hint && <small className={styles.hint}> {hint}</small>}</span>
    {options
      ? <select className={className} {...control}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      : <input className={className} {...control} />}
  </label>
}
