import { useCallback, useEffect, useRef, useState } from 'react'

// Matches the game-service cooldown (game.taunt-cooldown-millis); a taunt also never plays longer than this.
export const TAUNT_COOLDOWN_MILLIS = 5000
const storageKey = 'poker.taunts.enabled'

/**
 * Plays the taunt sounds the table sends. A player's new taunt cuts off their previous one.
 * speaking holds the accountIds whose taunt is playing; muting stops every taunt.
 */
export function useTauntPlayer(soundEnabled) {
  const [tauntsOn, setTauntsOn] = useState(() => { try { return localStorage.getItem(storageKey) !== 'false' } catch { return true } })
  const [speaking, setSpeaking] = useState(() => new Set())
  const playing = useRef(new Map())
  const audible = useRef(soundEnabled && tauntsOn)
  useEffect(() => { audible.current = soundEnabled && tauntsOn }, [soundEnabled, tauntsOn])

  // With audio given, only that taunt stops: a late end of an older sound leaves the newer one playing.
  const stop = useCallback((accountId, audio) => {
    const current = playing.current.get(accountId)
    if (!current || (audio && current.audio !== audio)) return
    current.audio.pause()
    window.clearTimeout(current.timer)
    playing.current.delete(accountId)
    setSpeaking(previous => {
      const next = new Set(previous)
      next.delete(accountId)
      return next
    })
  }, [])

  const play = useCallback(({ accountId, soundUrl }) => {
    if (!audible.current) return
    stop(accountId)
    const audio = new Audio(soundUrl)
    playing.current.set(accountId, { audio, timer: window.setTimeout(() => stop(accountId, audio), TAUNT_COOLDOWN_MILLIS) })
    audio.onended = () => stop(accountId, audio)
    setSpeaking(previous => new Set(previous).add(accountId))
    // A browser that blocks sound before the first click on the page simply skips it.
    audio.play().catch(() => stop(accountId, audio))
  }, [stop])

  const toggle = useCallback(() => {
    const next = !tauntsOn
    setTauntsOn(next)
    try { localStorage.setItem(storageKey, String(next)) } catch { /* Private mode keeps the setting in memory. */ }
    if (!next) [...playing.current.keys()].forEach(accountId => stop(accountId))
  }, [tauntsOn, stop])

  useEffect(() => {
    const active = playing.current
    return () => active.forEach(({ audio, timer }) => { audio.pause(); window.clearTimeout(timer) })
  }, [])

  return { play, speaking, muted: !tauntsOn, toggle }
}
