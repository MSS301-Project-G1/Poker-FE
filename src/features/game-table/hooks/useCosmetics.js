import { useEffect, useMemo, useState } from 'react'
import { fetchMyInventory } from '../api/cosmeticsApi'

// Shop category codes (shop-service categories).
const COSMETIC_CATEGORIES = { cardSkin: 'CARD_SKIN', table: 'TABLE', coinSkin: 'COIN_SKIN', dealer: 'DEALER', sound: 'SOUND' }

function metadataOf(item) {
  try {
    return (typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata) ?? {}
  } catch {
    return {}
  }
}

/**
 * The viewer's own cosmetics: equipped skins, which only this player sees, and every owned taunt sound,
 * which needs no equipping. Until the inventory loads, or when it cannot, the table keeps its defaults.
 */
export function useCosmetics(enabled) {
  const [items, setItems] = useState([])
  useEffect(() => {
    if (!enabled) return
    const abort = new AbortController()
    fetchMyInventory(abort.signal).then(response => setItems(response?.data ?? [])).catch(() => {})
    return () => abort.abort()
  }, [enabled])
  const cosmetics = useMemo(() => {
    const equipped = category => items.find(item => item.categoryCode === category && item.isEquipped)
    const deck = equipped(COSMETIC_CATEGORIES.cardSkin)
    const manifest = deck ? metadataOf(deck) : {}
    const dealer = equipped(COSMETIC_CATEGORIES.dealer)
    return {
      skin: { cards: manifest.cards ?? null, cardBack: manifest.cardBackUrl ?? deck?.assetUrl ?? null, felt: equipped(COSMETIC_CATEGORIES.table)?.assetUrl ?? null,
        dealer: dealer ? metadataOf(dealer).poses ?? null : null },
      chip: equipped(COSMETIC_CATEGORIES.coinSkin)?.assetUrl ?? null,
      sounds: items.filter(item => item.categoryCode === COSMETIC_CATEGORIES.sound)
        .map(item => ({ productId: item.productId, name: item.productName, iconUrl: item.assetUrl })),
    }
  }, [items])
  // Load every face up front, so a card turning over never shows an empty frame.
  useEffect(() => {
    Object.values(cosmetics.skin.cards ?? {}).forEach(url => { new Image().src = url })
  }, [cosmetics.skin.cards])
  return cosmetics
}
