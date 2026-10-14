import { useState } from 'react'

const storageKey = 'poker.lobby.checkInDismissed'

// The check-in modal opens once per browser session; closing it keeps it closed across navigation.
export function useDailyCheckIn() {
  const [open, setOpen] = useState(() => sessionStorage.getItem(storageKey) !== 'true')
  const update = value => {
    sessionStorage.setItem(storageKey, String(!value))
    setOpen(value)
  }
  return [open, update]
}
