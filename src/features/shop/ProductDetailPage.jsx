import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
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

const DEALER_POSE_CONFIG = [
  { key: 'idle', label: '1. Đứng Chờ (Idle)', icon: 'accessibility_new', desc: 'Tư thế chào đón & chờ người chơi cược' },
  { key: 'deal', label: '2. Chia Bài (Deal)', icon: 'pan_tool', desc: 'Đưa bài về phía các tay chơi trên bàn' },
  { key: 'flip', label: '3. Lật Bài (Flip)', icon: 'visibility', desc: 'Lật bài tẩy Flop / Turn / River kịch tính' },
  { key: 'win', label: '4. Ăn Mừng (Win)', icon: 'celebration', desc: 'Mỉm cười chúc mừng người chiến thắng' },
  { key: 'avatar', label: 'Avatar Bàn Chơi', icon: 'account_circle', desc: 'Ảnh đại diện Dealer thu nhỏ tại góc bàn' },
]

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
  const [isPlayingSound, setIsPlayingSound] = useState(false)
  const [activeDealerPose, setActiveDealerPose] = useState('idle')
  const [isAutoPlayingMatch, setIsAutoPlayingMatch] = useState(false)
  const soundAudioRef = useRef(null)

  const { vipCoin, isLoggedIn, refreshWallet } = useWallet()
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

  // Parse manifest / metadata from backend
  const deckManifest = useMemo(() => {
    if (!product?.metadata) return null
    try {
      return typeof product.metadata === 'string'
        ? JSON.parse(product.metadata)
        : product.metadata
    } catch (err) {
      console.error('Failed to parse product metadata:', err)
      return null
    }
  }, [product?.metadata])

  // Check if product is Dealer
  const isDealer = useMemo(() => {
    const code = String(product?.categoryCode || '').toUpperCase()
    const name = String(product?.categoryName || '').toLowerCase()
    return code.includes('DEALER') || name.includes('dealer') || Boolean(deckManifest?.poses)
  }, [product, deckManifest])

  // Check if product is Sound
  const isSound = useMemo(() => {
    const code = String(product?.categoryCode || '').toUpperCase()
    const name = String(product?.categoryName || '').toLowerCase()
    return code.includes('SOUND') || name.includes('sound') || name.includes('âm thanh')
  }, [product])

  // Dealer poses map
  const dealerPoses = useMemo(() => {
    if (!isDealer) return null
    const rawPoses = deckManifest?.poses || {}
    const fallback = product?.previewUrl || product?.assetUrl || ''
    return {
      idle: rawPoses.idle || fallback,
      deal: rawPoses.deal || rawPoses.idle || fallback,
      flip: rawPoses.flip || rawPoses.idle || fallback,
      win: rawPoses.win || rawPoses.idle || fallback,
      avatar: rawPoses.avatar || fallback,
    }
  }, [isDealer, deckManifest, product])

  // Auto-play match simulation sequence for Dealer (idle -> deal -> flip -> win)
  useEffect(() => {
    if (!isAutoPlayingMatch || !isDealer) return
    const sequence = ['idle', 'deal', 'flip', 'win']
    const timer = setInterval(() => {
      setActiveDealerPose(prev => {
        const idx = sequence.indexOf(prev)
        return sequence[(idx + 1) % sequence.length]
      })
    }, 2500)
    return () => clearInterval(timer)
  }, [isAutoPlayingMatch, isDealer])

  // Cleanup sound audio on unmount
  useEffect(() => {
    return () => {
      if (soundAudioRef.current) {
        soundAudioRef.current.pause()
        soundAudioRef.current = null
      }
    }
  }, [])

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

  // Real image URLs for active card face and back
  const currentCardCode = `${focusedCard.rank}${focusedCard.suit}`
  const currentFaceUrl = deckManifest?.cards?.[currentCardCode] || null
  const currentBackUrl = deckManifest?.cardBackUrl || product?.previewUrl || product?.assetUrl
  const soundUrl = deckManifest?.soundUrl || (isSound ? (product?.assetUrl || product?.previewUrl) : null)

  const handleTogglePlaySound = () => {
    if (!soundUrl) return
    if (!soundAudioRef.current) {
      soundAudioRef.current = new Audio(soundUrl)
      soundAudioRef.current.onended = () => setIsPlayingSound(false)
      soundAudioRef.current.onerror = () => setIsPlayingSound(false)
    }
    if (isPlayingSound) {
      soundAudioRef.current.pause()
      soundAudioRef.current.currentTime = 0
      setIsPlayingSound(false)
    } else {
      soundAudioRef.current
        .play()
        .then(() => setIsPlayingSound(true))
        .catch(() => setIsPlayingSound(false))
    }
  }

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

  // Handle Buy Click
  const handleBuyClick = () => {
    if (!isLoggedIn) {
      notify('Vui lòng đăng nhập để mua vật phẩm này.', { type: 'info' })
      navigate(paths.auth)
      return
    }
    setIsConfirmModalOpen(true)
  }

  // Handle Equip
  const handleEquip = async () => {
    if (!isLoggedIn) {
      notify('Vui lòng đăng nhập để thực hiện thao tác này.', { type: 'info' })
      navigate(paths.auth)
      return
    }
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

        {/* Top Feature Area: Interactive 3D Card / Dealer VIP Stage / Video Review & Details */}
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
                  assetUrl={currentBackUrl}
                  previewUrl={currentFaceUrl}
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
          ) : isDealer ? (
            /* Luxury Interactive VIP Dealer Stage with Multi-Pose & Simulation */
            <div className="lg:col-span-5 flex flex-col items-center p-6 rounded-3xl bg-gradient-to-b from-[#1b0d33] via-[#140a24] to-[#0c0517] border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
              {/* Top Bar on Stage */}
              <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black tracking-wider uppercase">
                  <Icon name="face" className="text-sm" /> AI Live Dealer
                </span>
                <span className="text-[11px] text-white/60 font-medium">
                  {activeDealerPose === 'avatar' ? 'Ảnh đại diện góc bàn' : `Tư thế: ${activeDealerPose.toUpperCase()}`}
                </span>
              </div>

              {/* Main Dealer Display Area */}
              <div className="w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden relative border border-amber-400/30 bg-black/60 shadow-[0_15px_35px_rgba(0,0,0,0.9)] flex items-center justify-center group mb-4">
                {activeDealerPose === 'avatar' ? (
                  <div className="w-48 h-48 rounded-full p-2 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-[0_0_40px_rgba(245,158,11,0.4)] relative overflow-hidden flex items-center justify-center">
                    {dealerPoses?.avatar ? (
                      <img
                        src={dealerPoses.avatar}
                        alt="Dealer Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Icon name="person" className="text-7xl text-amber-300" />
                    )}
                  </div>
                ) : dealerPoses?.[activeDealerPose] ? (
                  <img
                    key={activeDealerPose}
                    src={dealerPoses[activeDealerPose]}
                    alt={product.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-all duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/40 gap-2">
                    <Icon name="person" className="text-6xl text-amber-400/40" />
                    <span className="text-xs">Chưa có ảnh tư thế này</span>
                  </div>
                )}

                {/* Floating pose badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-lg">
                    <span className={`w-2 h-2 rounded-full ${isAutoPlayingMatch ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                    {DEALER_POSE_CONFIG.find(p => p.key === activeDealerPose)?.label || activeDealerPose}
                  </span>
                </div>
              </div>

              {/* Simulation Action Button */}
              <div className="w-full flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setIsAutoPlayingMatch(prev => !prev)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
                    isAutoPlayingMatch
                      ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  <Icon name={isAutoPlayingMatch ? 'pause_circle' : 'play_circle'} className="text-base" />
                  <span>{isAutoPlayingMatch ? 'Dừng Mô Phỏng' : '▶ Auto-Play Mô Phỏng Ván Đấu'}</span>
                </button>
              </div>

              {/* Pose Switcher Tabs */}
              <div className="w-full flex items-center justify-between gap-1 p-1 bg-black/40 rounded-xl border border-white/10">
                {DEALER_POSE_CONFIG.map(p => {
                  const isActive = activeDealerPose === p.key
                  const hasImage = Boolean(dealerPoses?.[p.key])
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => {
                        setIsAutoPlayingMatch(false)
                        setActiveDealerPose(p.key)
                      }}
                      className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 relative ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 shadow font-black'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                      title={p.desc}
                    >
                      <Icon name={p.icon} className="text-sm" />
                      <span className="truncate max-w-[55px]">{p.key.toUpperCase()}</span>
                      {hasImage && !isActive && (
                        <span className="w-1 h-1 rounded-full bg-amber-400/80 absolute top-1 right-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : isSound ? (
            /* Audio Soundboard Stage */
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-3xl bg-[#140a24]/90 border border-white/10 shadow-2xl relative">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-900 via-indigo-950 to-black border-4 border-amber-400/30 shadow-[0_0_50px_rgba(168,85,247,0.3)] flex items-center justify-center relative mb-6">
                <div className={`w-36 h-36 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center ${isPlayingSound ? 'animate-spin' : ''}`}>
                  <button
                    type="button"
                    onClick={handleTogglePlaySound}
                    className="w-20 h-20 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center transition-transform active:scale-95 shadow-xl"
                  >
                    <Icon name={isPlayingSound ? 'pause' : 'play_arrow'} className="text-4xl" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Icon name="graphic_eq" className="text-lg" />
                <span>{isPlayingSound ? 'Đang phát âm thanh mẫu...' : 'Nhấn nút để nghe thử âm thanh'}</span>
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

            {soundUrl && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-950/40 border border-purple-400/30">
                <button
                  type="button"
                  onClick={handleTogglePlaySound}
                  className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center hover:bg-amber-300 transition-transform active:scale-95 shadow-md shrink-0"
                  title={isPlayingSound ? 'Dừng âm thanh' : 'Nghe âm thanh hiệu ứng'}
                >
                  <Icon name={isPlayingSound ? 'pause' : 'volume_up'} className="text-xl" />
                </button>
                <div className="text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Icon name="music_note" className="text-sm" /> Âm thanh vui nhộn đính kèm
                  </span>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    Nhấn nút để nghe thử hiệu ứng âm thanh trêu đùa của vật phẩm
                  </p>
                </div>
              </div>
            )}

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
            ) : isDealer ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs">
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Trạng thái biểu cảm</span>
                  <span className="font-headline font-bold text-sm text-amber-400">4 Tư Thế Động</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Diễn hoạt AI</span>
                  <span className="font-headline font-bold text-sm text-white">Idle, Deal, Flip, Win</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Tương thích</span>
                  <span className="font-headline font-bold text-sm text-white">Mọi Bàn Poker</span>
                </div>
              </div>
            ) : isSound ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs">
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Định dạng</span>
                  <span className="font-headline font-bold text-sm text-amber-400">MP3 / WAV Audio</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Chất lượng</span>
                  <span className="font-headline font-bold text-sm text-white">320kbps Stereo</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Kích hoạt</span>
                  <span className="font-headline font-bold text-sm text-white">Tự Động Theo Sự Kiện</span>
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
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled
                    icon="check_circle"
                    className="!bg-white/10 !text-white/45 !border-white/10 !cursor-not-allowed !opacity-60"
                  >
                    Đã trang bị
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
                    onClick={handleBuyClick}
                  >
                    Mua Ngay Bằng VIP Coin
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: 52 Cards Deck Inspection Grid OR 4-Pose Dealer Showcase */}
        {isDeckSkin ? (
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
                const cardFaceUrl = deckManifest?.cards?.[c.id] || null

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setFocusedCard({ rank: c.rank, suit: c.suit })
                      setIs3DFlipped(false)
                    }}
                    className={`transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 cursor-pointer ${
                      isCurrentFocused ? 'ring-2 ring-amber-400 rounded-xl' : ''
                    }`}
                  >
                    <div className="w-full aspect-[2/3]">
                      <CosmeticRenderer
                        categoryCode="CARD_SKIN"
                        rank={c.rank}
                        suit={c.suit}
                        previewUrl={cardFaceUrl}
                        assetUrl={currentBackUrl}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ) : isDealer ? (
          <section className="rounded-3xl bg-[#140a24]/90 border border-white/10 p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
              <div>
                <h2 className="font-headline font-black text-xl text-white flex items-center gap-2">
                  <Icon name="theater_comedy" className="text-amber-400 text-2xl" />
                  <span>Trọn Bộ 4 Trạng Thái Động Của Dealer</span>
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  Cô em chia bài sở hữu 4 sắc thái tương tác linh hoạt theo thời gian thực tương ứng với từng giai đoạn của ván poker.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-bold flex items-center gap-1.5">
                  <Icon name="touch_app" className="text-sm" /> Bấm vào thẻ để xem trực tiếp trên sân khấu
                </span>
              </div>
            </div>

            {/* 4 Poses Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {DEALER_POSE_CONFIG.filter(p => p.key !== 'avatar').map((pose, idx) => {
                const imgUrl = dealerPoses?.[pose.key] || product?.previewUrl || product?.assetUrl
                const isCurrentActive = activeDealerPose === pose.key

                return (
                  <div
                    key={pose.key}
                    onClick={() => {
                      setIsAutoPlayingMatch(false)
                      setActiveDealerPose(pose.key)
                    }}
                    className={`rounded-2xl p-4 transition-all duration-300 cursor-pointer border flex flex-col items-center ${
                      isCurrentActive
                        ? 'bg-gradient-to-b from-amber-500/15 to-[#1c0f33] border-amber-400/80 shadow-[0_10px_25px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/40 -translate-y-1.5'
                        : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.08] hover:-translate-y-1'
                    }`}
                  >
                    {/* Pose Image Frame */}
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-black/50 border border-white/10 relative mb-4 flex items-center justify-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={pose.label}
                          className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                        />
                      ) : (
                        <div className="text-center p-4 text-white/40">
                          <Icon name={pose.icon} className="text-4xl mb-1 text-white/30" />
                          <div className="text-[11px]">Chưa nạp ảnh</div>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-black text-amber-300 border border-white/10">
                        P-0{idx + 1}
                      </span>
                      {isCurrentActive && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow">
                          <Icon name="visibility" className="text-xs" /> Đang Xem
                        </span>
                      )}
                    </div>

                    {/* Pose Info */}
                    <div className="w-full text-center">
                      <h4 className="font-bold text-sm text-white mb-1 flex items-center justify-center gap-1.5">
                        <Icon name={pose.icon} className="text-sm text-amber-400" />
                        <span>{pose.label}</span>
                      </h4>
                      <p className="text-[11px] text-white/60 line-clamp-2">
                        {pose.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}
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
