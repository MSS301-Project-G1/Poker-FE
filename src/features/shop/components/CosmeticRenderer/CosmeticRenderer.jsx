import { useState, useEffect } from 'react'
import { Icon } from '@/shared/ui'
import styles from './CosmeticRenderer.module.css'

const SUIT_SYMBOLS = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
}

export default function CosmeticRenderer({
  categoryCode = 'CARD_SKIN',
  previewUrl = null,
  assetUrl = null,
  rank = 'A',
  suit = 'S',
  isFlipped = false,
  interactive = false,
  onFlip = null,
  productName = '',
  className = '',
}) {
  const [internalFlipped, setInternalFlipped] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [backImageError, setBackImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [previewUrl, assetUrl])

  useEffect(() => {
    setBackImageError(false)
  }, [assetUrl, previewUrl])

  const effectiveFlipped = onFlip ? isFlipped : internalFlipped
  const handleToggleFlip = () => {
    if (!interactive) return
    if (onFlip) {
      onFlip(!isFlipped)
    } else {
      setInternalFlipped(f => !f)
    }
  }

  const normalizedCategory = String(categoryCode || '').toUpperCase()
  const isRedSuit = suit === 'H' || suit === 'D'
  const suitChar = SUIT_SYMBOLS[suit] || suit

  // 0. Dealer Skin Renderer
  if (normalizedCategory.includes('DEALER')) {
    const dealerImg = previewUrl || assetUrl
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className="relative flex flex-col items-center justify-center p-3">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-tertiary via-secondary-container to-error shadow-xl relative overflow-hidden flex items-center justify-center">
            {dealerImg && !imageError ? (
              <img
                src={dealerImg}
                alt={productName || 'Dealer'}
                className="w-full h-full object-cover rounded-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <Icon name="person" className="text-4xl text-tertiary-fixed" />
            )}
          </div>
          <span className="mt-2 text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary-fixed border border-tertiary/30">
            DEALER
          </span>
        </div>
      </div>
    )
  }

  // 1. Table Felt Renderer
  if (normalizedCategory.includes('TABLE')) {
    const isRedTable = productName.toLowerCase().includes('đỏ') || productName.toLowerCase().includes('red')
    const isBlueTable = productName.toLowerCase().includes('lam') || productName.toLowerCase().includes('dạ quang') || productName.toLowerCase().includes('blue') || productName.toLowerCase().includes('neon')
    const tableImg = previewUrl || assetUrl
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className={styles.tableStage}>
          <div
            className={`${styles.tableFelt} ${
              isRedTable ? styles.tableFeltRed : isBlueTable ? styles.tableFeltBlue : ''
            }`}
          >
            {tableImg && !imageError ? (
              <img
                src={tableImg}
                alt={productName || 'Table Felt'}
                className="w-full h-full object-cover rounded-[9999px]"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className={styles.tableLogo}>MSS POKER TABLE</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 2. VFX / All-In / Victory Effect Renderer
  if (normalizedCategory.includes('EFFECT')) {
    const isFlame = ['lửa', 'rồng', 'fire', 'flame', 'dragon'].some(word => productName.toLowerCase().includes(word))
    const effectImg = previewUrl || assetUrl
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className={styles.effectStage}>
          <div className={`${styles.effectAura} ${isFlame ? styles.effectFlameAura : ''}`} />
          {effectImg && !imageError ? (
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-tertiary/40 bg-obsidian/60 p-1 flex items-center justify-center shadow-xl">
                <img
                  src={effectImg}
                  alt={productName || 'VFX'}
                  className="w-full h-full object-contain"
                  onError={() => setImageError(true)}
                />
              </div>
              <span className={styles.effectTag}>
                {normalizedCategory.includes('VICTORY') ? 'VFX VICTORY' : 'VFX ALL-IN'}
              </span>
            </div>
          ) : (
            <div className={styles.effectBadge}>
              <div className={styles.effectIconWrap}>
                <Icon name={isFlame ? 'local_fire_department' : 'auto_awesome'} />
              </div>
              <span className={styles.effectTag}>
                {normalizedCategory.includes('VICTORY') ? 'VFX VICTORY' : 'VFX ALL-IN'}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 3. Avatar Frame Renderer
  if (normalizedCategory.includes('FRAME')) {
    const frameImg = previewUrl || assetUrl
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className={styles.frameStage}>
          {frameImg && !imageError ? (
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-on-secondary-fixed to-on-secondary-fixed flex items-center justify-center text-white/50">
                <Icon name="person" className="text-3xl" />
              </div>
              <img
                src={frameImg}
                alt={productName || 'Avatar Frame'}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <>
              <div className={styles.frameBorder} />
              <div className={styles.frameAvatar}>
                <Icon name="person" />
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // 4. Poker Chip / Coin Skin Renderer
  if (normalizedCategory.includes('COIN') || normalizedCategory.includes('CHIP')) {
    const chipImg = previewUrl || assetUrl
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className="relative flex flex-col items-center justify-center p-2">
          {chipImg && !imageError ? (
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-tertiary/60 shadow-2xl bg-obsidian/60 flex items-center justify-center p-0.5 relative group">
              <img
                src={chipImg}
                alt={productName || 'Poker Chip'}
                className="w-full h-full object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className={styles.chipStage}>
              <div className={styles.chipCenter}>VIP</div>
            </div>
          )}
          <span className="mt-2 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary-fixed border border-tertiary/30 uppercase">
            CHIP VIP
          </span>
        </div>
      </div>
    )
  }

  // 5. Sound / Audio Effect Renderer
  if (normalizedCategory.includes('SOUND') || normalizedCategory.includes('AUDIO')) {
    const soundImg = previewUrl || assetUrl
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className="relative flex flex-col items-center justify-center p-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-secondary-container via-secondary-container to-tertiary p-1 shadow-2xl flex items-center justify-center relative overflow-hidden group">
            {soundImg && !imageError ? (
              <img
                src={soundImg}
                alt={productName || 'Sound FX'}
                className="w-full h-full object-cover rounded-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-obsidian/85 flex items-center justify-center border-2 border-dashed border-tertiary/40">
                <Icon name="graphic_eq" className="text-4xl text-tertiary animate-pulse" />
              </div>
            )}
            <div className="absolute inset-0 bg-tertiary/10 rounded-full animate-ping pointer-events-none" />
          </div>
          <span className="mt-2.5 text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary border border-secondary-container/30 uppercase">
            SOUND FX
          </span>
          <span className="text-[11px] text-white/70 font-bold mt-1 text-center max-w-[140px] truncate">
            {productName || 'Sound effect'}
          </span>
        </div>
      </div>
    )
  }

  // 6. Emoji / Reaction Renderer
  if (normalizedCategory.includes('EMOJI') || normalizedCategory.includes('REACTION')) {
    const emojiImg = previewUrl || assetUrl
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className="relative flex flex-col items-center justify-center p-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-tertiary to-tertiary-container p-2 shadow-xl flex items-center justify-center">
            {emojiImg && !imageError ? (
              <img
                src={emojiImg}
                alt={productName}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <Icon name="sentiment_very_satisfied" className="text-4xl text-on-tertiary" />
            )}
          </div>
          <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary-fixed border border-tertiary/30 uppercase">
            EMOJI
          </span>
        </div>
      </div>
    )
  }

  // 7. Generic Non-Card Cosmetic Renderer
  if (!normalizedCategory.includes('CARD') && !normalizedCategory.includes('SKIN') && normalizedCategory !== '') {
    const genImg = previewUrl || assetUrl
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className="relative flex flex-col items-center justify-center p-4">
          <div className="w-24 h-24 rounded-2xl bg-obsidian/60 border border-tertiary/30 p-2 shadow-xl flex items-center justify-center overflow-hidden">
            {genImg && !imageError ? (
              <img
                src={genImg}
                alt={productName}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <Icon name="category" className="text-4xl text-tertiary/60" />
            )}
          </div>
          <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 uppercase">
            {normalizedCategory || 'ITEM'}
          </span>
        </div>
      </div>
    )
  }

  // 8. Playing Card & Deck Renderer (CARD_SKIN or default)
  const isShowingBack = effectiveFlipped
  const isAtlas = assetUrl && (assetUrl.includes('deck_atlas') || assetUrl.endsWith('.json'))
  const isPreviewAtlas = previewUrl && (previewUrl.includes('deck_atlas') || previewUrl.endsWith('.json'))
  const safeAssetUrl = !isAtlas ? assetUrl : null
  const safePreviewUrl = !isPreviewAtlas ? previewUrl : null
  const cardBackSrc = safeAssetUrl || safePreviewUrl
  const cardFaceSrc = safePreviewUrl || (!interactive ? safeAssetUrl : null)

  return (
    <div className={`${styles.rendererWrapper} ${className}`}>
      <div
        className={`${styles.cardStage} ${interactive ? styles.cardStageInteractive : ''}`}
        onClick={handleToggleFlip}
      >
        <div className={`${styles.cardInner} ${isShowingBack ? styles.flipped : ''}`}>
          {/* Card Face */}
          <div className={styles.cardFace}>
            {cardFaceSrc && !imageError ? (
              <img
                src={cardFaceSrc}
                alt=""
                className={styles.cardImg}
                onError={e => {
                  e.currentTarget.style.display = 'none'
                  setImageError(true)
                }}
              />
            ) : null}
            {(!cardFaceSrc || imageError) && (
              <>
                <div className={`${styles.cornerTop} ${isRedSuit ? styles.redSuit : styles.blackSuit}`}>
                  <span className="text-sm font-mono font-black">{rank}</span>
                  <span className="text-xs">{suitChar}</span>
                </div>
                <div className={`${styles.centerSuit} ${isRedSuit ? styles.redSuit : styles.blackSuit}`}>
                  {suitChar}
                </div>
                <div className={`${styles.cornerBottom} ${isRedSuit ? styles.redSuit : styles.blackSuit}`}>
                  <span className="text-sm font-mono font-black">{rank}</span>
                  <span className="text-xs">{suitChar}</span>
                </div>
              </>
            )}
          </div>

          {/* Card Back */}
          <div className={styles.cardBack}>
            {cardBackSrc && !backImageError ? (
              <img
                src={cardBackSrc}
                alt=""
                className={styles.cardImg}
                onError={e => {
                  e.currentTarget.style.display = 'none'
                  setBackImageError(true)
                }}
              />
            ) : (
              <div className={styles.cardBackTexture}>
                <span className={styles.cardBackEmblem}>MSS POKER</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
