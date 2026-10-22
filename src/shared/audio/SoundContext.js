import { createContext, useContext } from 'react'

export const SoundContext = createContext({ enabled: true, toggle: () => {}, play: () => {} })
export const useSound = () => useContext(SoundContext)
