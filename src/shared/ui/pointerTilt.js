// Pointer position is measured before the first tilt to avoid feedback jitter.
const bounds = new WeakMap()
const reset = element => { element.style.removeProperty('--tilt-x'); element.style.removeProperty('--tilt-y'); bounds.delete(element) }
export const pointerTilt = {
  onPointerEnter(event) { bounds.set(event.currentTarget, event.currentTarget.getBoundingClientRect()) },
  onPointerMove(event) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const element = event.currentTarget, rect = bounds.get(element)
    if (!rect) return
    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1))
    const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1))
    element.style.setProperty('--tilt-x', (-y * 5) + 'deg')
    element.style.setProperty('--tilt-y', (x * 5) + 'deg')
  },
  onPointerLeave(event) { reset(event.currentTarget) },
  onPointerCancel(event) { reset(event.currentTarget) },
}
