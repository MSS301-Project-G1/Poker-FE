import { useLayoutEffect, useState } from 'react'

/**
 * Free height in px between the pot and the seats above it (plates and cards), where an equipped dealer can stand
 * without covering anyone. Measured again when the table resizes and when a new snapshot lays the seats out.
 */
export function useDealerRoom(tableRef, snapshot, enabled) {
  const [room, setRoom] = useState(0)
  useLayoutEffect(() => {
    const table = tableRef.current
    if (!enabled || !table) return undefined
    const measure = () => {
      const pot = table.querySelector('[data-pot]')?.getBoundingClientRect()
      if (!pot) return
      const above = [...table.querySelectorAll('[data-seat], [data-seat] *')].map(element => element.getBoundingClientRect())
        .filter(box => box.height && box.bottom <= pot.top && box.right > pot.left && box.left < pot.right)
      setRoom(Math.round(pot.top - Math.max(table.getBoundingClientRect().top, ...above.map(box => box.bottom))))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(table)
    return () => observer.disconnect()
  }, [tableRef, snapshot, enabled])
  return room
}
