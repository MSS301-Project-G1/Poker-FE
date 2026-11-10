import { useNavigate } from 'react-router'
import { Icon } from '@/shared/ui'
import { Button } from '../shared/ui'
import { formatVipCoin, getTierBadge } from '../utils/shopFormatters'
import CosmeticRenderer from './CosmeticRenderer'

export default function ConfirmPurchaseModal({
  isOpen,
  product,
  currentVipCoin = 0,
  isPurchasing = false,
  onConfirm,
  onClose,
}) {
  const navigate = useNavigate()

  if (!isOpen || !product) return null

  const price = product.priceVipCoin || 0
  const hasSufficient = currentVipCoin >= price
  const remaining = currentVipCoin - price
  const deficit = price - currentVipCoin
  const tierInfo = getTierBadge(product.tier)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-raised overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center">
              <Icon name="shopping_cart_checkout" className="text-lg" />
            </span>
            <h3 className="font-headline font-bold text-base text-on-surface">
              Confirm purchase
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPurchasing}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        {/* Product Summary Box */}
        <div className="my-5 p-4 rounded-2xl bg-surface-container/70 border border-outline-variant/20 flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center p-1 shrink-0 overflow-hidden">
            <CosmeticRenderer
              categoryCode={product.categoryCode}
              previewUrl={product.previewUrl}
              assetUrl={product.assetUrl}
              productName={product.name}
              rank="A"
              suit="S"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span
              className={`w-fit px-2 py-0.2 rounded-full text-[11px] font-bold ${tierInfo.className}`}
            >
              {tierInfo.label}
            </span>
            <h4 className="font-headline font-bold text-sm text-on-surface truncate">
              {product.name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-on-surface-variant">Price:</span>
              <span className="font-mono font-bold text-tertiary flex items-center gap-1">
                <Icon name="paid" className="text-xs" /> {formatVipCoin(price)} VIP Coin
              </span>
            </div>
          </div>
        </div>

        {/* Balance Breakdown */}
        <div className="space-y-2.5 p-4 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/20 text-xs">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span>Current VIP Coin balance:</span>
            <span className="font-mono font-semibold text-on-surface">
              {formatVipCoin(currentVipCoin)}
            </span>
          </div>

          <div className="flex justify-between items-center text-on-surface-variant">
            <span>Cost:</span>
            <span className="font-mono font-semibold text-tertiary">
              - {formatVipCoin(price)}
            </span>
          </div>

          <div className="border-t border-outline-variant/30 pt-2 flex justify-between items-center font-bold">
            <span className="text-on-surface">Balance after purchase:</span>
            <span
              className={`font-mono text-sm ${
                hasSufficient ? 'text-success' : 'text-error'
              }`}
            >
              {hasSufficient ? formatVipCoin(remaining) : 'Not enough coins'}
            </span>
          </div>
        </div>

        {/* Insufficient Balance Notice */}
        {!hasSufficient && (
          <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/30 flex items-start gap-2.5 text-xs text-error">
            <Icon name="error" className="text-base text-error shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Not enough VIP Coin</p>
              <p className="text-error/80 mt-0.5">
                You need <strong>{formatVipCoin(deficit)} VIP Coin</strong> more. Top up to keep shopping.
              </p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            size="md"
            disabled={isPurchasing}
            onClick={onClose}
          >
            Close
          </Button>

          {hasSufficient ? (
            <Button
              variant="gold"
              size="md"
              icon="check_circle"
              loading={isPurchasing}
              onClick={onConfirm}
            >
              Buy
            </Button>
          ) : (
            <Button
              variant="gold"
              size="md"
              icon="add_card"
              onClick={() => {
                onClose()
                navigate('/shop/bundles')
              }}
            >
              Top up VIP Coin
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
