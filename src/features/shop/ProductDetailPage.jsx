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
  { code: 'ALL', label: 'All 52 cards', icon: 'style' },
  { code: 'S', label: '♠ Spades', icon: '♠' },
  { code: 'H', label: '♥ Hearts', icon: '♥' },
  { code: 'D', label: '♦ Diamonds', icon: '♦' },
  { code: 'C', label: '♣ Clubs', icon: '♣' },
]

const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']

const DEALER_POSE_CONFIG = [
  { key: 'idle', label: '1. Idle', icon: 'accessibility_new', desc: 'Greets players and waits for bets' },
  { key: 'deal', label: '2. Deal', icon: 'pan_tool', desc: 'Deals cards to the players' },
  { key: 'flip', label: '3. Flip', icon: 'visibility', desc: 'Turns the flop, turn and river' },
  { key: 'win', label: '4. Win', icon: 'celebration', desc: 'Congratulates the winner' },
  { key: 'avatar', label: 'Table avatar', icon: 'account_circle', desc: 'Small dealer portrait in the table corner' },
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
          setError(err.message || 'Couldn’t load product details')
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
      notify(`You bought “${product.name}”.`, { type: 'success' })
      setIsConfirmModalOpen(false)
      await Promise.all([refreshWallet(), refreshInventory()])
      const updated = await productService.getProductDetail(id)
      if (updated?.data) setProduct(updated.data)
    } catch (err) {
      notify(err.message || 'Purchase failed', { type: 'error' })
    } finally {
      setIsPurchasing(false)
    }
  }

  // Handle Buy Click
  const handleBuyClick = () => {
    if (!isLoggedIn) {
      notify('Sign in to buy this item.', { type: 'info' })
      navigate(paths.auth)
      return
    }
    setIsConfirmModalOpen(true)
  }

  // Handle Equip
  const handleEquip = async () => {
    if (!isLoggedIn) {
      notify('Sign in to do this.', { type: 'info' })
      navigate(paths.auth)
      return
    }
    try {
      await equipItem(id)
      notify(`Equipped “${product.name}”.`, { type: 'success' })
      await refreshInventory()
    } catch (err) {
      notify(err.message || 'Couldn’t equip', { type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center gap-3">
        <span className="w-10 h-10 border-4 border-tertiary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-on-surface/70 font-medium">Loading item…</span>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="w-full max-w-4xl mx-auto py-24 text-center px-4">
        <h3 className="text-xl font-bold text-error mb-2">Product not found</h3>
        <p className="text-sm text-on-surface/60 mb-6">{error || 'This product doesn’t exist or was removed.'}</p>
        <Button variant="secondary" onClick={() => navigate('/shop')}>
          Back to shop
        </Button>
      </div>
    )
  }

  const tierInfo = getTierBadge(product.tier)

  return (
    <div className="relative w-full pb-space-lg overflow-hidden font-body-md text-on-surface">
      <div className="w-full px-6 lg:px-12 pt-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 pb-6 border-b border-on-surface/10 mb-8">
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-on-surface/5 hover:bg-on-surface/10 border border-on-surface/10 text-xs font-bold transition-all"
          >
            <Icon name="arrow_back" className="text-sm" />
            <span>Shop</span>
          </button>
          <span className="text-on-surface/40">/</span>
          <span className="text-xs text-tertiary font-bold">{product.categoryName || 'Card deck skin'}</span>
          <span className="text-on-surface/40">/</span>
          <span className="text-xs text-on-surface/80 font-medium truncate">{product.name}</span>
        </div>

        {/* Top Feature Area: Interactive 3D Card / Dealer VIP Stage / Video Review & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Stage */}
          {isDeckSkin ? (
            /* 3D Interactive Rotating Card Stage for Playing Cards */
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl bg-surface-container-lowest/90 border border-on-surface/10 shadow-raised relative">
              <div className="w-56 h-80 relative mb-6 drop-shadow-xl">
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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary/20 hover:bg-tertiary/30 text-tertiary border border-tertiary/40 text-xs font-bold transition-all shadow-md"
                >
                  <Icon name="3d_rotation" className="text-base" />
                  <span>{is3DFlipped ? 'Show card front' : 'Flip to card back'}</span>
                </button>
              </div>
              <p className="text-xs text-on-surface/60 mt-3 font-medium flex items-center gap-1.5">
                <Icon name="touch_app" className="text-xs text-tertiary" />
                <span>Click the card or the button above to flip it</span>
              </p>
            </div>
          ) : isDealer ? (
            /* Luxury Interactive VIP Dealer Stage with Multi-Pose & Simulation */
            <div className="lg:col-span-5 flex flex-col items-center p-6 rounded-2xl bg-background border border-tertiary/30 shadow-raised relative overflow-hidden">
              {/* Top Bar on Stage */}
              <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-on-surface/10">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-tertiary/20 text-tertiary-fixed border border-tertiary/30 text-[11px] font-bold">
                  <Icon name="face" className="text-sm" /> AI Live Dealer
                </span>
                <span className="text-[11px] text-on-surface/60 font-medium">
                  {activeDealerPose === 'avatar' ? 'Table corner portrait' : `Pose: ${activeDealerPose.toUpperCase()}`}
                </span>
              </div>

              {/* Main Dealer Display Area */}
              <div className="w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden relative border border-tertiary/30 bg-obsidian/60 shadow-raised flex items-center justify-center group mb-4">
                {activeDealerPose === 'avatar' ? (
                  <div className="w-48 h-48 rounded-full p-2 bg-tertiary relative overflow-hidden flex items-center justify-center">
                    {dealerPoses?.avatar ? (
                      <img
                        src={dealerPoses.avatar}
                        alt="Dealer Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Icon name="person" className="text-7xl text-tertiary-fixed" />
                    )}
                  </div>
                ) : dealerPoses?.[activeDealerPose] ? (
                  <img
                    key={activeDealerPose}
                    src={dealerPoses[activeDealerPose]}
                    alt={product.name}
                    className="w-full h-full object-contain filter drop-shadow-xl transition-all duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-on-surface/40 gap-2">
                    <Icon name="person" className="text-6xl text-tertiary/40" />
                    <span className="text-xs">No image for this pose yet</span>
                  </div>
                )}

                {/* Floating pose badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-obsidian/75 backdrop-blur-md border border-on-surface/10 text-[11px] font-bold text-on-surface flex items-center gap-1.5 shadow-lg">
                    <span className={`w-2 h-2 rounded-full ${isAutoPlayingMatch ? 'bg-success ' : 'bg-tertiary'}`} />
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
                      ? 'bg-error/20 border border-error/50 text-error hover:bg-error/30'
                      : ' bg-tertiary hover:bg-tertiary text-on-tertiary '
                  }`}
                >
                  <Icon name={isAutoPlayingMatch ? 'pause_circle' : 'play_circle'} className="text-base" />
                  <span>{isAutoPlayingMatch ? 'Stop preview' : '▶ Play hand preview'}</span>
                </button>
              </div>

              {/* Pose Switcher Tabs */}
              <div className="w-full flex items-center justify-between gap-1 p-1 bg-obsidian/40 rounded-xl border border-on-surface/10">
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
                          ? 'bg-tertiary text-on-tertiary shadow font-bold'
                          : 'text-on-surface/70 hover:text-on-surface hover:bg-on-surface/10'
                      }`}
                      title={p.desc}
                    >
                      <Icon name={p.icon} className="text-sm" />
                      <span className="truncate max-w-[55px]">{p.key.toUpperCase()}</span>
                      {hasImage && !isActive && (
                        <span className="w-1 h-1 rounded-full bg-tertiary/80 absolute top-1 right-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : isSound ? (
            /* Audio Soundboard Stage */
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl bg-surface-container-lowest/90 border border-on-surface/10 shadow-raised relative">
              <div className="w-48 h-48 rounded-full bg-on-secondary-fixed border-4 border-tertiary/30 flex items-center justify-center relative mb-6">
                <div className={`w-36 h-36 rounded-full border-2 border-dashed border-on-surface/20 flex items-center justify-center ${isPlayingSound ? 'animate-spin' : ''}`}>
                  <button
                    type="button"
                    onClick={handleTogglePlaySound}
                    className="w-20 h-20 rounded-full bg-tertiary hover:bg-tertiary-fixed text-on-tertiary flex items-center justify-center transition-transform active:scale-95 shadow-raised"
                  >
                    <Icon name={isPlayingSound ? 'pause' : 'play_arrow'} className="text-4xl" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-bold text-tertiary-fixed flex items-center gap-2">
                <Icon name="graphic_eq" className="text-lg" />
                <span>{isPlayingSound ? 'Playing sample…' : 'Press to preview the sound'}</span>
              </p>
            </div>
          ) : product.previewVideoUrl ? (
            /* Video Review Stage for Non-Cards (Effects, Tables, Frames) */
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-container-lowest/90 border border-on-surface/10 shadow-raised relative">
              <div className="w-full h-80 rounded-2xl overflow-hidden relative bg-obsidian shadow-raised">
                <video
                  src={product.previewVideoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 bg-obsidian/60 backdrop-blur-md px-3 py-1 rounded-lg border border-on-surface/10 text-xs font-bold text-tertiary flex items-center gap-1.5 pointer-events-none">
                  <Icon name="play_circle" className="text-sm" />
                  <span>Effect preview video</span>
                </div>
              </div>
              <p className="text-xs text-on-surface/60 mt-3 font-medium flex items-center gap-1.5">
                <Icon name="videocam" className="text-xs text-tertiary" />
                <span>Recorded at a real table</span>
              </p>
            </div>
          ) : (
            /* Animated Stage Showcase if Video Review is not yet provided */
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl bg-surface-container-lowest/90 border border-on-surface/10 shadow-raised relative">
              <div className="w-64 h-64 relative mb-4 flex items-center justify-center">
                <CosmeticRenderer
                  categoryCode={product.categoryCode}
                  previewUrl={product.previewUrl}
                  assetUrl={product.assetUrl}
                  productName={product.name}
                  className="w-full h-full"
                />
              </div>
              <div className="px-3 py-1.5 rounded-full bg-on-surface/5 border border-on-surface/10 text-xs font-bold text-on-surface/80 flex items-center gap-1.5">
                <Icon name="view_in_ar" className="text-sm text-tertiary" />
                <span>3D Live Stage Preview</span>
              </div>
            </div>
          )}

          {/* Right: Product Info & Action CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-5 p-8 rounded-2xl bg-surface-container-lowest/90 border border-on-surface/10 shadow-raised">
            <div className="flex items-center justify-between gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${tierInfo.className}`}>
                {tierInfo.label}
              </span>
              {isEquipped ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success border border-success/30 text-xs font-bold">
                  <Icon name="check_circle" className="text-sm" /> Equipped
                </span>
              ) : isOwned ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 text-xs font-bold">
                  <Icon name="verified" className="text-sm" /> In your inventory
                </span>
              ) : null}
            </div>

            <div>
              <h1 className="font-headline font-bold text-2xl md:text-3xl text-on-surface mb-2">{product.name}</h1>
              <p className="text-sm text-on-surface/70 leading-relaxed">
                {product.description || 'A premium cosmetic for MSS Poker.'}
              </p>
            </div>

            {soundUrl && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-on-secondary-fixed/40 border border-secondary/30">
                <button
                  type="button"
                  onClick={handleTogglePlaySound}
                  className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center hover:bg-tertiary-fixed transition-transform active:scale-95 shadow-md shrink-0"
                  title={isPlayingSound ? 'Stop sound' : 'Play sound effect'}
                >
                  <Icon name={isPlayingSound ? 'pause' : 'volume_up'} className="text-xl" />
                </button>
                <div className="text-xs">
                  <span className="font-bold text-tertiary-fixed flex items-center gap-1.5">
                    <Icon name="music_note" className="text-sm" /> Includes a fun sound
                  </span>
                  <p className="text-[11px] text-on-surface/60 mt-0.5">
                    Press to preview this item’s taunt sound
                  </p>
                </div>
              </div>
            )}

            {/* Specs Grid: Dynamic per cosmetic type */}
            {isDeckSkin ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-on-surface/5 border border-on-surface/5 text-xs">
                <div>
                  <span className="text-on-surface/40 block text-[11px] font-bold">Count</span>
                  <span className="font-headline font-bold text-sm text-on-surface">52 playing cards</span>
                </div>
                <div>
                  <span className="text-on-surface/40 block text-[11px] font-bold">Standard</span>
                  <span className="font-headline font-bold text-sm text-tertiary">4 suits (♠, ♥, ♦, ♣)</span>
                </div>
                <div>
                  <span className="text-on-surface/40 block text-[11px] font-bold">Resolution</span>
                  <span className="font-headline font-bold text-sm text-on-surface">2K Ultra HD</span>
                </div>
              </div>
            ) : isDealer ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-on-surface/5 border border-on-surface/5 text-xs">
                <div>
                  <span className="text-on-surface/40 block text-[11px] font-bold">Expressions</span>
                  <span className="font-headline font-bold text-sm text-tertiary">4 animated poses</span>
                </div>
                <div>
                  <span className="text-on-surface/40 block text-[11px] font-bold">AI animation</span>
                  <span className="font-headline font-bold text-sm text-on-surface">Idle, Deal, Flip, Win</span>
                </div>
                <div>
                  <span className="text-on-surface/40 block text-[11px] font-bold">Works with</span>
                  <span className="font-headline font-bold text-sm text-on-surface">Every poker table</span>
                </div>
              </div>
            ) : isSound ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-on-surface/5 border border-on-surface/5 text-xs">
                <div>
                  <span className="text-on-surface/40 block text-[11px] font-bold">Format</span>
                  <span className="font-headline font-bold text-sm text-tertiary">MP3 / WAV Audio</span>
                </div>
                <div>
                  <span className="text-on-surface/40 block text-[11px] font-bold">Quality</span>
                  <span className="font-headline font-bold text-sm text-on-surface">320kbps Stereo</span>
                </div>
                <div>
                  <span className="text-on-surface/40 block text-[11px] font-bold">Trigger</span>
                  <span className="font-headline font-bold text-sm text-on-surface">Automatic on events</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-on-surface/5 border border-on-surface/5 text-xs">
                <div>
                  <span className="text-on-surface/40 block text-[11px] font-bold">Item type</span>
                  <span className="font-headline font-bold text-sm text-on-surface">{product.categoryName || 'Item'}</span>
                </div>
                <div>
                  <span className="text-on-surface/40 block text-[11px] font-bold">Effect</span>
                  <span className="font-headline font-bold text-sm text-tertiary">Dynamic 60 FPS</span>
                </div>
                <div>
                  <span className="text-on-surface/40 block text-[11px] font-bold">Works with</span>
                  <span className="font-headline font-bold text-sm text-on-surface">Every table</span>
                </div>
              </div>
            )}

            {/* Price & Action Button */}
            <div className="pt-4 border-t border-on-surface/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-on-surface/50">Price</span>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary font-bold shadow-md">
                    <Icon name="paid" className="text-sm" />
                  </span>
                  <span className="font-mono font-bold text-2xl text-tertiary">
                    {formatVipCoin(product.priceVipCoin)}
                  </span>
                  <span className="text-xs text-on-surface/60 font-mono">VIP Coin</span>
                </div>
              </div>

              <div>
                {isEquipped ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled
                    icon="check_circle"
                    className="!bg-on-surface/10 !text-on-surface/45 !border-on-surface/10 !cursor-not-allowed !opacity-60"
                  >
                    Equipped
                  </Button>
                ) : isOwned ? (
                  <Button variant="primary" size="lg" icon="swap_horiz" onClick={handleEquip}>
                    Equip now
                  </Button>
                ) : product.isExclusive ? (
                  <Button variant="secondary" size="lg" disabled>
                    Exclusive item
                  </Button>
                ) : (
                  <Button
                    variant="gold"
                    size="lg"
                    icon="shopping_bag"
                    onClick={handleBuyClick}
                  >
                    Buy with VIP Coin
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: 52 Cards Deck Inspection Grid OR 4-Pose Dealer Showcase */}
        {isDeckSkin ? (
          <section className="rounded-2xl bg-surface-container-lowest/90 border border-on-surface/10 p-6 md:p-8 shadow-raised">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-on-surface/10">
              <div>
                <h2 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2">
                  <Icon name="style" className="text-tertiary text-2xl" />
                  <span>All 52 cards</span>
                </h2>
                <p className="text-xs text-on-surface/60 mt-0.5">
                  Click any card to enlarge it and flip it in the preview above.
                </p>
              </div>

              {/* Suit Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-obsidian/40 rounded-xl border border-on-surface/10 overflow-x-auto">
                {SUITS.map(suit => (
                  <button
                    key={suit.code}
                    type="button"
                    onClick={() => setSelectedSuit(suit.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      selectedSuit === suit.code
                        ? 'bg-tertiary text-on-tertiary shadow-md font-bold'
                        : 'text-on-surface/70 hover:text-on-surface hover:bg-on-surface/10'
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
                      isCurrentFocused ? 'ring-2 ring-tertiary rounded-xl' : ''
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
          <section className="rounded-2xl bg-surface-container-lowest/90 border border-on-surface/10 p-6 md:p-8 shadow-raised">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-on-surface/10">
              <div>
                <h2 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2">
                  <Icon name="theater_comedy" className="text-tertiary text-2xl" />
                  <span>All 4 dealer poses</span>
                </h2>
                <p className="text-xs text-on-surface/60 mt-1">
                  The dealer has 4 poses that react in real time to each stage of the hand.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-tertiary/10 text-tertiary-fixed border border-tertiary/20 text-xs font-bold flex items-center gap-1.5">
                  <Icon name="touch_app" className="text-sm" /> Click a pose to preview it
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
                        ? ' bg-tertiary/15 border-tertiary/80 shadow-raised ring-2 ring-tertiary/40 -translate-y-1.5'
                        : 'bg-on-surface/5 border-on-surface/10 hover:border-on-surface/30 hover:bg-on-surface/[0.08] hover:-translate-y-1'
                    }`}
                  >
                    {/* Pose Image Frame */}
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-obsidian/50 border border-on-surface/10 relative mb-4 flex items-center justify-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={pose.label}
                          className="w-full h-full object-contain filter drop-shadow-xl"
                        />
                      ) : (
                        <div className="text-center p-4 text-on-surface/40">
                          <Icon name={pose.icon} className="text-4xl mb-1 text-on-surface/30" />
                          <div className="text-[11px]">No image yet</div>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-obsidian/70 backdrop-blur-sm text-[11px] font-bold text-tertiary-fixed border border-on-surface/10">
                        P-0{idx + 1}
                      </span>
                      {isCurrentActive && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-tertiary text-on-tertiary text-[11px] font-bold flex items-center gap-1 shadow">
                          <Icon name="visibility" className="text-xs" /> Viewing
                        </span>
                      )}
                    </div>

                    {/* Pose Info */}
                    <div className="w-full text-center">
                      <h4 className="font-bold text-sm text-on-surface mb-1 flex items-center justify-center gap-1.5">
                        <Icon name={pose.icon} className="text-sm text-tertiary" />
                        <span>{pose.label}</span>
                      </h4>
                      <p className="text-[11px] text-on-surface/60 line-clamp-2">
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
