import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * One open popover per list. Attach `ref` to the element holding both the trigger and the popover:
 * clicking the trigger again, clicking anywhere outside, or pressing Escape closes it.
 */
export function usePopover() {
  const [openId, setOpenId] = useState(null)
  const ref = useRef(null)
  useEffect(() => {
    if (openId === null) return
    const outside = event => { if (!ref.current?.contains(event.target)) setOpenId(null) }
    const escape = event => { if (event.key === 'Escape') setOpenId(null) }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [openId])
  const toggle = useCallback(id => setOpenId(current => current === id ? null : id), [])
  return { openId, ref, toggle }
}
