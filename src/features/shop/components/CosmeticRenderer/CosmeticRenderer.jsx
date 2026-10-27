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
  }, [previewUrl])

  useEffect(() => {
    setBackImageError(false)
  }, [assetUrl])

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
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className="relative flex flex-col items-center justify-center p-3">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-purple-500 to-rose-500 shadow-xl relative overflow-hidden flex items-center justify-center">
            {previewUrl || assetUrl ? (
              <img
                src={previewUrl || assetUrl}
                alt={productName || 'Dealer'}
                className="w-full h-full object-cover rounded-full"
                onError={e => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <Icon name="person" className="text-4xl text-amber-300" />
            )}
          </div>
          <span className="mt-2 text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
            DEALER
          </span>
        </div>
      </div>
    )
  }

  // 1. Table Felt Renderer
  if (normalizedCategory.includes('TABLE')) {
    const isRedTable = productName.toLowerCase().includes('đỏ')
    const isBlueTable = productName.toLowerCase().includes('lam') || productName.toLowerCase().includes('dạ quang')
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className={styles.tableStage}>
          <div
            className={`${styles.tableFelt} ${
              isRedTable ? styles.tableFeltRed : isBlueTable ? styles.tableFeltBlue : ''
            }`}
          >
            {previewUrl && !imageError ? (
              <img
                src={previewUrl}
                alt="Table Felt"
                className={styles.cardImg}
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
    const isFlame = productName.toLowerCase().includes('lửa') || productName.toLowerCase().includes('rồng')
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className={styles.effectStage}>
          <div className={`${styles.effectAura} ${isFlame ? styles.effectFlameAura : ''}`} />
          <div className={styles.effectBadge}>
            <div className={styles.effectIconWrap}>
              <Icon name={isFlame ? 'local_fire_department' : 'auto_awesome'} />
            </div>
            <span className={styles.effectTag}>VFX ALL-IN</span>
          </div>
        </div>
      </div>
    )
  }

  // 3. Avatar Frame Renderer
  if (normalizedCategory.includes('FRAME')) {
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className={styles.frameStage}>
          <div className={styles.frameBorder} />
          <div className={styles.frameAvatar}>
            <Icon name="person" />
          </div>
        </div>
      </div>
    )
  }

  // 4. Poker Chip / Coin Skin Renderer
  if (normalizedCategory.includes('COIN') || normalizedCategory.includes('CHIP')) {
    return (
      <div className={`${styles.rendererWrapper} ${className}`}>
        <div className={styles.chipStage}>
          <div className={styles.chipCenter}>VIP</div>
        </div>
      </div>
    )
  }

  // 5. Playing Card & Deck Renderer (CARD_SKIN or default)
  const isShowingBack = effectiveFlipped

  return (
    <div className={`${styles.rendererWrapper} ${className}`}>
      <div
        className={`${styles.cardStage} ${interactive ? styles.cardStageInteractive : ''}`}
        onClick={handleToggleFlip}
      >
        <div className={`${styles.cardInner} ${isShowingBack ? styles.flipped : ''}`}>
          {/* Card Face */}
          <div className={styles.cardFace}>
            {previewUrl && !imageError ? (
              <img
                src={previewUrl}
                alt=""
                className={styles.cardImg}
                onError={e => {
                  e.currentTarget.style.display = 'none'
                  setImageError(true)
                }}
              />
            ) : null}
            {(!previewUrl || imageError) && (
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
            {assetUrl && !backImageError ? (
              <img
                src={assetUrl}
                alt=""
                className={styles.cardImg}
                onError={e => {
                  e.currentTarget.style.display = 'none'
                  setBackImageError(true)
                }}
              />
            ) : null}
            {(!assetUrl || backImageError) && (
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

