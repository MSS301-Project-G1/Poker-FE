import styles from './ProductSelect.module.css'

// Picks a shop product for a skin reward; while the shop list is unavailable the product id is typed instead.
export default function ProductSelect({ products, value, onChange, exclude = [], label, disabled = false }) {
  if (products.phase !== 'ready' || products.items.length === 0) {
    return <input className={styles.field} aria-label={label} value={value} disabled={disabled || products.phase === 'loading'}
      placeholder={products.phase === 'loading' ? 'Loading skins…' : 'Product id'} onChange={event => onChange(event.target.value.trim())} />
  }
  return <select className={styles.field} aria-label={label} value={value} disabled={disabled} onChange={event => onChange(event.target.value)}>
    <option value="">Choose a skin…</option>
    {products.items.map(product => <option key={product.id} value={product.id} disabled={exclude.includes(product.id)}>
      {product.name} · {product.categoryName}</option>)}
  </select>
}
