import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Icon, useToast } from '@/shared/ui'
import { Button } from './shared/ui'
import * as productService from './services/productService'
import { useWallet } from './hooks/useWallet'
import { useInventory } from './hooks/useInventory'
import { getTierBadge, formatVipCoin, isCardProduct } from './utils/shopFormatters'
import CosmeticRenderer from './components/CosmeticRenderer'
import ConfirmPurchaseModal from './components/ConfirmPurchaseModal'

const SUITS = [
  { code: 'ALL', label: 'Tất cả 52 lá', icon: 'style' },
  { code: 'S', label: '♠ Bích (Spades)', icon: '♠' },
  { code: 'H', label: '♥ Cơ (Hearts)', icon: '♥' },
  { code: 'D', label: '♦ Rô (Diamonds)', icon: '♦' },
  { code: 'C', label: '♣ Tép (Clubs)', icon: '♣' },
]

const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const notify = useToast()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSuit, setSelectedSuit] = useState('ALL')
  const [focusedCard, setFocusedCard] = useState({ rank: 'A', suit: 'S' })
  const [is3DFlipped, setIs3DFlipped] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const { vipCoin, refreshWallet } = useWallet()
  const { items: inventoryItems, equipItem, refreshInventory } = useInventory()

  // Fetch product detail
  useEffect(() => {
    let disposed = false
    async function load() {
      try {
        const res = await productService.getProductDetail(id)
        if (!disposed && res?.data) {
          setProduct(res.data)
        }
      } catch (err) {
        if (!disposed) {
          setError(err.message || 'Không thể tải thông tin chi tiết sản phẩm')
        }
      } finally {
        if (!disposed) setLoading(false)
      }
    }
    void load()
    return () => {
      disposed = true
    }
  }, [id])

  // Check if product is owned / equipped
  const isOwned = useMemo(() => {
    return inventoryItems.some(i => i.productId === id) || Boolean(product?.isOwned)
  }, [inventoryItems, product, id])

  const isEquipped = useMemo(() => {
    const inv = inventoryItems.find(i => i.productId === id)
    return Boolean(inv?.isEquipped)
  }, [inventoryItems, id])

  const isDeckSkin = useMemo(() => isCardProduct(product), [product])

  // 52 cards dataset
  const deckCards = useMemo(() => {
    const list = []
    const targetSuits = selectedSuit === 'ALL' ? ['S', 'H', 'D', 'C'] : [selectedSuit]
    targetSuits.forEach(suit => {
      RANKS.forEach(rank => {
        list.push({ rank, suit, id: `${rank}${suit}` })
      })
    })
    return list
  }, [selectedSuit])

  // Handle Purchase
  const handleConfirmPurchase = async () => {
    if (!product || isPurchasing) return
    setIsPurchasing(true)
    try {
      await productService.purchaseProduct(product.id)
      notify(`Mua thành công skin bộ bài "${product.name}"!`, { type: 'success' })
      setIsConfirmModalOpen(false)
      await Promise.all([refreshWallet(), refreshInventory()])
      const updated = await productService.getProductDetail(id)
      if (updated?.data) setProduct(updated.data)
    } catch (err) {
      notify(err.message || 'Giao dịch mua thất bại', { type: 'error' })
    } finally {
      setIsPurchasing(false)
    }
  }

  // Handle Equip
  const handleEquip = async () => {
    try {
      await equipItem(id)
      notify(`Đã trang bị skin "${product.name}".`, { type: 'success' })
      await refreshInventory()
    } catch (err) {
      notify(err.message || 'Không thể trang bị', { type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center gap-3">
        <span className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-white/70 font-medium">Đang tải thông tin vật phẩm...</span>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="w-full max-w-4xl mx-auto py-24 text-center px-4">
        <h3 className="text-xl font-bold text-rose-400 mb-2">Không tìm thấy sản phẩm</h3>
        <p className="text-sm text-white/60 mb-6">{error || 'Sản phẩm không tồn tại hoặc đã bị xóa.'}</p>
        <Button variant="secondary" onClick={() => navigate('/shop')}>
          Quay lại Cửa Hàng
        </Button>
      </div>
    )
  }

  const tierInfo = getTierBadge(product.tier)

  return (
    <div className="relative w-full pb-space-lg overflow-hidden font-body-md text-white">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full px-6 lg:px-12 pt-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-8">
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all"
          >
            <Icon name="arrow_back" className="text-sm" />
            <span>Cửa Hàng</span>
          </button>
          <span className="text-white/40">/</span>
          <span className="text-xs text-amber-400 font-bold uppercase">{product.categoryName || 'Skin Bộ Bài'}</span>
          <span className="text-white/40">/</span>
          <span className="text-xs text-white/80 font-medium truncate">{product.name}</span>
        </div>

        {/* Top Feature Area: Interactive 3D Card / Video Review & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Stage */}
          {isDeckSkin ? (
            /* 3D Interactive Rotating Card Stage for Playing Cards */
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-3xl bg-[#140a24]/90 border border-white/10 shadow-2xl relative">
              <div className="w-56 h-80 relative mb-6 drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]">
                <CosmeticRenderer
                  categoryCode={product.categoryCode}
                  rank={focusedCard.rank}
                  suit={focusedCard.suit}
                  isFlipped={is3DFlipped}
                  onFlip={setIs3DFlipped}
                  interactive
                  assetUrl={product.assetUrl}
                  previewUrl={product.previewUrl}
                  productName={product.name}
                  className="w-full h-full"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIs3DFlipped(f => !f)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-400/40 text-xs font-bold transition-all shadow-md"
                >
                  <Icon name="3d_rotation" className="text-base" />
                  <span>{is3DFlipped ? 'Xem Mặt Trước Lá Bài' : 'Lật Xem Mặt Lưng (3D Flip)'}</span>
                </button>
              </div>
              <p className="text-xs text-white/60 mt-3 font-medium flex items-center gap-1.5">
                <Icon name="touch_app" className="text-xs text-amber-400" />
                <span>Bấm trực tiếp vào lá bài hoặc nút trên để xoay lật 3D</span>
              </p>
            </div>
          ) : product.previewVideoUrl ? (
            /* Video Review Stage for Non-Cards (Effects, Tables, Frames) */
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#140a24]/90 border border-white/10 shadow-2xl relative">
              <div className="w-full h-80 rounded-2xl overflow-hidden relative bg-black shadow-2xl">
                <video
                  src={product.previewVideoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs font-bold text-amber-400 flex items-center gap-1.5 pointer-events-none">
                  <Icon name="play_circle" className="text-sm" />
                  <span>Video Review Hiệu Ứng</span>
                </div>
              </div>
              <p className="text-xs text-white/60 mt-3 font-medium flex items-center gap-1.5">
                <Icon name="videocam" className="text-xs text-amber-400" />
                <span>Video demo thực tế trong bàn thi đấu</span>
              </p>
            </div>
          ) : (
            /* Animated Stage Showcase if Video Review is not yet provided */
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-3xl bg-[#140a24]/90 border border-white/10 shadow-2xl relative">
              <div className="w-64 h-64 relative mb-4 flex items-center justify-center">
                <CosmeticRenderer
                  categoryCode={product.categoryCode}
                  previewUrl={product.previewUrl}
                  assetUrl={product.assetUrl}
                  productName={product.name}
                  className="w-full h-full"
                />
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 flex items-center gap-1.5">
                <Icon name="view_in_ar" className="text-sm text-amber-400" />
                <span>3D Live Stage Preview</span>
              </div>
            </div>
          )}

          {/* Right: Product Info & Action CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-5 p-8 rounded-3xl bg-[#140a24]/90 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${tierInfo.className}`}>
                {tierInfo.label}
              </span>
              {isEquipped ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  <Icon name="check_circle" className="text-sm" /> Đang Trang Bị
                </span>
              ) : isOwned ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 text-xs font-bold">
                  <Icon name="verified" className="text-sm" /> Đã Sở Hữu Trong Túi Đồ
                </span>
              ) : null}
            </div>

            <div>
              <h1 className="font-headline font-black text-2xl md:text-3xl text-white mb-2">{product.name}</h1>
              <p className="text-sm text-white/70 leading-relaxed">
                {product.description || 'Vật phẩm trang trí cao cấp trên nền tảng MSS Poker.'}
              </p>
            </div>

            {/* Specs Grid: Dynamic per cosmetic type */}
            {isDeckSkin ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs">
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Số lượng</span>
                  <span className="font-headline font-bold text-sm text-white">52 Lá Bài Tây</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Quy chuẩn</span>
                  <span className="font-headline font-bold text-sm text-amber-400">4 Chất (♠, ♥, ♦, ♣)</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Độ phân giải</span>
                  <span className="font-headline font-bold text-sm text-white">2K Ultra HD</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs">
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Loại vật phẩm</span>
                  <span className="font-headline font-bold text-sm text-white">{product.categoryName || 'Vật phẩm'}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Hiệu ứng</span>
                  <span className="font-headline font-bold text-sm text-amber-400">Dynamic 60 FPS</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Tương thích</span>
                  <span className="font-headline font-bold text-sm text-white">Mọi Bàn Chơi</span>
                </div>
              </div>
            )}

            {/* Price & Action Button */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Giá vật phẩm</span>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-md">
                    <Icon name="paid" className="text-sm" />
                  </span>
                  <span className="font-mono font-black text-2xl text-amber-400">
                    {formatVipCoin(product.priceVipCoin)}
                  </span>
                  <span className="text-xs text-white/60 font-mono">VIP Coin</span>
                </div>
              </div>

              <div>
                {isEquipped ? (
                  <Button variant="secondary" size="lg" disabled>
                    Đang sử dụng
                  </Button>
                ) : isOwned ? (
                  <Button variant="primary" size="lg" icon="swap_horiz" onClick={handleEquip}>
                    Trang bị ngay
                  </Button>
                ) : product.isExclusive ? (
                  <Button variant="secondary" size="lg" disabled>
                    Vật phẩm độc quyền
                  </Button>
                ) : (
                  <Button
                    variant="gold"
                    size="lg"
                    icon="shopping_bag"
                    onClick={() => setIsConfirmModalOpen(true)}
                  >
                    Mua Ngay Bằng VIP Coin
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 52 Cards Deck Inspection Grid (ONLY SHOWN FOR PLAYING CARDS) */}
        {isDeckSkin && (
          <section className="rounded-3xl bg-[#140a24]/90 border border-white/10 p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div>
                <h2 className="font-headline font-black text-xl text-white flex items-center gap-2">
                  <Icon name="style" className="text-amber-400 text-2xl" />
                  <span>Trọn Bộ 52 Lá Bài Tây</span>
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Bấm vào lá bài bất kỳ để hiển thị phóng to và lật mặt 3D tại khung bên trên.
                </p>
              </div>

              {/* Suit Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10 overflow-x-auto">
                {SUITS.map(suit => (
                  <button
                    key={suit.code}
                    type="button"
                    onClick={() => setSelectedSuit(suit.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      selectedSuit === suit.code
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {suit.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards Grid: 13 cards per row or responsive grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-2.5">
              {deckCards.map(c => {
                const isCurrentFocused = focusedCard.rank === c.rank && focusedCard.suit === c.suit

                return (
                  <div
                    key={c.id}
                    onClick={() => setFocusedCard({ rank: c.rank, suit: c.suit })}
                    className={`transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 cursor-pointer ${
                      isCurrentFocused ? 'ring-2 ring-amber-400 rounded-xl' : ''
                    }`}
                  >
                    <div className="w-full aspect-[2/3]">
                      <CosmeticRenderer
                        categoryCode="CARD_FACE"
                        rank={c.rank}
                        suit={c.suit}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmPurchaseModal
        isOpen={isConfirmModalOpen}
        product={product}
        currentVipCoin={vipCoin}
        isPurchasing={isPurchasing}
        onConfirm={handleConfirmPurchase}
        onClose={() => setIsConfirmModalOpen(false)}
      />
    </div>
  )
}
