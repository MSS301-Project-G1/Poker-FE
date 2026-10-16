import { useState } from 'react'
import { Icon } from '@/shared/ui'
import styles from './CosmeticRenderer.module.css'

const SUIT_SYMBOLS = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
}

export default function CosmeticRenderer({
  categoryCode = 'CARD_FACE',
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

  // 5. Playing Card & Deck Renderer (CARD_FACE, CARD_BACK, or default)
  const isBackDefault = normalizedCategory === 'CARD_BACK'
  const isShowingBack = isBackDefault ? !effectiveFlipped : effectiveFlipped

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

