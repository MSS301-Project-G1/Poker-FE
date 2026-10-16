import { useNavigate } from 'react-router'
import { Icon } from '@/shared/ui'
import { Button } from '../shared/ui'
import { formatVipCoin, isCardProduct } from '../utils/shopFormatters'
import CosmeticRenderer from './CosmeticRenderer'
import styles from './ProductCard.module.css'

export default function ProductCard({
  product,
  isSelected = false,
  isEquipped = false,
  isEquipping = false,
  onSelect,
  onBuy,
  onEquip,
}) {
  const navigate = useNavigate()
  const isDeckSkin = isCardProduct(product)

  const getTierClass = tier => {
    switch (tier) {
      case 'SUPER_VIP':
      case 'LEGENDARY':
        return styles.tierLegendary
      case 'VIP':
      case 'EPIC':
        return styles.tierEpic
      case 'RARE':
        return styles.tierRare
      default:
        return styles.tierStandard
    }
  }

  const getTierLabel = tier => {
    switch (tier) {
      case 'SUPER_VIP':
        return 'SUPER VIP'
      case 'VIP':
        return 'VIP'
      case 'NORMAL':
        return 'STANDARD'
      default:
        return tier || 'STANDARD'
    }
  }

  return (
    <div
      onClick={onSelect}
      className={`${styles.card} ${isSelected ? styles.cardSelected : ''} ${
        isEquipped ? styles.cardEquipped : ''
      }`}
    >
      {/* Top Header: Tier Badge & Ownership Status */}
      <div className={styles.header}>
        <span className={`${styles.tierBadge} ${getTierClass(product.tier)}`}>
          {getTierLabel(product.tier)}
        </span>

        {isEquipped ? (
          <span className={`${styles.statusBadge} ${styles.statusEquipped}`}>
            <Icon name="check_circle" className="text-xs" /> Đang Dùng
          </span>
        ) : product.isOwned ? (
          <span className={`${styles.statusBadge} ${styles.statusOwned}`}>
            <Icon name="verified" className="text-xs" /> Đã Sở Hữu
          </span>
        ) : product.isExclusive ? (
          <span className={`${styles.statusBadge} ${styles.statusExclusive}`}>
            <Icon name="lock" className="text-xs" /> Độc Quyền
          </span>
        ) : null}
      </div>

      {/* Unified Cosmetic Visualizer (No AI placeholders or broken boxes) */}
      <div className={styles.previewBox}>
        <CosmeticRenderer
          categoryCode={product.categoryCode}
          previewUrl={product.previewUrl}
          assetUrl={product.assetUrl}
          productName={product.name}
          rank="A"
          suit="S"
        />
        <span className={styles.categoryTag}>{product.categoryName || 'Vật phẩm'}</span>
      </div>

      {/* Info: Name & Description */}
      <div className={styles.infoArea}>
        <h4 className={styles.title} title={product.name}>
          {product.name}
        </h4>
        <p className={styles.description}>
          {product.description || 'Skin và vật phẩm trang trí bàn chơi poker.'}
        </p>
      </div>

      {/* Footer: Price & CTA Actions */}
      <div className={styles.footer}>
        {product.isOwned ? (
          <div className={styles.ownedTag}>
            <Icon name="inventory_2" />
            <span>Trong túi đồ</span>
          </div>
        ) : (
          <div className={styles.priceArea}>
            <span className={styles.coinIcon}>
              <Icon name="paid" />
            </span>
            <span className={styles.priceVal}>{formatVipCoin(product.priceVipCoin)}</span>
            <span className={styles.priceUnit}>VIP</span>
          </div>
        )}

        <div className={styles.actionsGroup}>
          {/* Detail Link for 52-Card Decks */}
          {isDeckSkin && (
            <button
              type="button"
              title="Xem trọn bộ 52 lá bài"
              onClick={e => {
                e.stopPropagation()
                navigate(`/shop/products/${product.id}`)
              }}
              className={styles.inspectBtn}
            >
              <Icon name="visibility" className={styles.inspectIcon} />
              <span>52 Lá</span>
            </button>
          )}

          {isEquipped ? (
            <Button variant="secondary" size="sm" disabled>
              Đang dùng
            </Button>
          ) : product.isOwned ? (
            <Button
              variant="primary"
              size="sm"
              icon="swap_horiz"
              loading={isEquipping}
              onClick={e => {
                e.stopPropagation()
                onEquip?.(product)
              }}
            >
              Trang bị
            </Button>
          ) : product.isExclusive ? (
            <Button variant="secondary" size="sm" disabled>
              Khóa
            </Button>
          ) : (
            <Button
              variant="gold"
              size="sm"
              icon="shopping_cart"
              onClick={e => {
                e.stopPropagation()
                onBuy?.(product)
              }}
            >
              Mua ngay
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

