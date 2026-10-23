import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AudioSystem } from './AudioSystem'
import { SoundContext } from './SoundContext'

const storageKey = 'poker.sound.enabled'
export default function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(() => { try { return localStorage.getItem(storageKey) !== 'false' } catch { return true } })
  const system = useRef(null)
  const preference = useRef(enabled)
  useEffect(() => {
    const audio = new AudioSystem()
    audio.enabled = preference.current
    system.current = audio
    function click(event) {
      if (event.target instanceof Element && event.target.closest('button:not(:disabled), a[href]')) {
        void audio.unlock().then(() => audio.play('click')).catch(() => {})
      }
    }
    document.addEventListener('click', click)
    return () => { document.removeEventListener('click', click); audio.dispose(); system.current = null }
  }, [])
  const play = useCallback(name => system.current?.play(name), [])
  const toggle = useCallback(() => setEnabled(previous => {
    const next = !previous
    preference.current = next
    if (system.current) system.current.enabled = next
    try { localStorage.setItem(storageKey, String(next)) } catch { /* Private mode keeps the setting in memory. */ }
    return next
  }), [])
  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play])
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}
