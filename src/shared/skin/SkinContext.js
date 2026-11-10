import { createContext, useContext } from 'react'

/**
 * The viewer's own equipped cosmetics; anything missing keeps the default renderer.
 * cards maps card codes (AS, 10H, …) to face images; cardBack and felt are image URLs;
 * dealer maps poses (idle, deal, flip, win) to images.
 */
export const SkinContext = createContext({ cards: null, cardBack: null, felt: null, dealer: null })
export const useSkin = () => useContext(SkinContext)
