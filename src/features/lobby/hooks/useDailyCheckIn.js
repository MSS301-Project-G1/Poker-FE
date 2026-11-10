import { useState } from 'react'

const storageKey = 'poker.lobby.checkInDismissed'

// The check-in modal opens by itself once per browser session where autoOpen is true (the lobby);
// closing it keeps it closed across navigation. openCheckIn (the navbar button) opens it on any screen.
export function useDailyCheckIn(autoOpen) {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(storageKey) === 'true')
  const [requested, setRequested] = useState(false)
  const close = () => {
    sessionStorage.setItem(storageKey, 'true')
    setDismissed(true)
    setRequested(false)
  }
  return { open: requested || (autoOpen && !dismissed), openCheckIn: () => setRequested(true), close }
}
