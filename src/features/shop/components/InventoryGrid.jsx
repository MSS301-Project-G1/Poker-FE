import { Icon, useToast } from '@/shared/ui'
import { Button } from '../shared/ui'
import { getCategoryIcon } from '../utils/shopFormatters'
import CosmeticRenderer from './CosmeticRenderer'

export default function InventoryGrid({
  items = [],
  loading = false,
  actionInProgressId = null,
  onEquip,
  onUnequip,
  onSelectProduct,
}) {
  const notify = useToast()
  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center gap-3">
        <span className="w-8 h-8 border-3 border-tertiary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-on-surface-variant font-medium">Đang tải túi đồ của bạn...</span>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="w-full py-16 px-4 rounded-3xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/40 mb-3">
          <Icon name="inventory_2" className="text-3xl" />
        </div>
        <h4 className="font-headline font-bold text-lg text-on-surface mb-1">
          Túi đồ của bạn đang trống
        </h4>
        <p className="text-sm text-on-surface-variant max-w-md">
          Bạn chưa sở hữu vật phẩm trang trí nào. Hãy duyệt qua danh mục Shop để sắm ngay những skin
          lá bài và bàn chơi độc đáo nhất!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map(item => {
        const isEquipped = Boolean(item.isEquipped)
        const isActionRunning = actionInProgressId === item.id

        return (
          <div
            key={item.id}
            onClick={() => onSelectProduct?.(item)}
            className={`group relative rounded-2xl bg-surface-container-low/90 backdrop-blur-md p-4 border flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg ${
              isEquipped
                ? 'border-tertiary ring-2 ring-tertiary/40 bg-surface-container'
                : 'border-outline-variant/30 hover:border-primary/50'
            }`}
          >
            {/* Header: Category & Equipped/Maintenance Badges */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant px-2 py-0.5 rounded-lg bg-surface-container-highest">
                <Icon name={getCategoryIcon(item.categoryCode)} className="text-xs" />
                {item.categoryName || 'Vật phẩm'}
              </span>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {item.isDeleting ? (
                  <span
                    className="flex items-center gap-1 text-rose-300 text-[10px] font-bold bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse"
                    title={item.deletionNotice || 'Sản phẩm sắp bị xóa và sẽ tự động hoàn 100% xu vào ví'}
                  >
                    <Icon name="timer" className="text-xs text-rose-400" /> Sắp xóa (Tự hoàn xu)
                  </span>
                ) : item.productStatus === 'MAINTAIN' ? (
                  <span
                    className="flex items-center gap-1 text-amber-300 text-[10px] font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30"
                    title="Vật phẩm đang tạm ngưng phục vụ"
                  >
                    <Icon name="pause_circle" className="text-xs text-amber-400" /> Tạm ngưng
                  </span>
                ) : null}

                {isEquipped && (
                  <span className="flex items-center gap-1 text-tertiary text-xs font-black bg-tertiary/10 px-2 py-0.5 rounded-full border border-tertiary/30">
                    <Icon name="check_circle" className="text-xs" /> Đang dùng
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail via CosmeticRenderer */}
            <div className="relative w-full h-36 rounded-xl bg-surface-container-lowest/80 overflow-hidden mb-3 border border-outline-variant/20 flex items-center justify-center p-2">
              <CosmeticRenderer
                categoryCode={item.categoryCode}
                previewUrl={item.previewUrl || item.assetUrl}
                assetUrl={item.assetUrl}
                productName={item.productName}
                rank="A"
                suit="S"
              />
            </div>

            {/* Title */}
            <div className="mb-4">
              <h4 className="font-headline font-bold text-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                {item.productName}
              </h4>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Nguồn: {item.source || 'PURCHASE'}
              </span>
            </div>

            {/* Action Equip / Unequip */}
            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-end">
              {isEquipped ? (
                <Button
                  variant="secondary"
                  size="sm"
                  icon="remove_circle_outline"
                  loading={isActionRunning}
                  onClick={e => {
                    e.stopPropagation()
                    onUnequip?.(item.productId)
                  }}
                >
                  Gỡ bỏ
                </Button>
              ) : item.isDeleting ? (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    notify(
                      `Vật phẩm "${item.productName}" đã được lên lịch xóa và đang chuẩn bị tự động hoàn tiền vào ví!`,
                      { type: 'warning' }
                    )
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Sản phẩm đang được lên lịch xóa và tự động hoàn trả 100% xu vào ví"
                >
                  <Icon name="timer" className="text-xs text-rose-400 animate-pulse" />
                  <span>Sắp xóa (Tự hoàn xu)</span>
                </button>
              ) : item.productStatus === 'MAINTAIN' ? (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    notify(
                      `Vật phẩm "${item.productName}" hiện đang tạm ngưng phục vụ, tạm thời không thể kích hoạt trang bị!`,
                      { type: 'warning' }
                    )
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Vật phẩm đang tạm ngưng phục vụ, tạm thời không thể trang bị"
                >
                  <Icon name="pause_circle" className="text-xs text-amber-400" />
                  <span>Tạm khóa (Tạm ngưng)</span>
                </button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon="check"
                  loading={isActionRunning}
                  onClick={e => {
                    e.stopPropagation()
                    onEquip?.(item.productId)
                  }}
                >
                  Trang bị
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
