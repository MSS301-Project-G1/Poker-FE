import chipStyles from '../components/ChipStack.module.css'
import { timing } from './timeline'

// Short-lived movement drawn straight on the DOM, so React state only ever holds the real table.
const chipsPerFlight = 3
const chipStagger = 60
const chipColors = ['primary', 'gold', 'violet']

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const centre = rect => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

/** Hole cards start at the pot and fly to their seat; delays come from the plan, minus the time already gone. */
export function dealCards(table, delays, elapsed) {
  const origin = table?.querySelector('[data-pot]')
  if (!origin || reducedMotion()) return
  const start = centre(origin.getBoundingClientRect())
  for (const [seatIndex, cardDelays] of Object.entries(delays)) {
    table.querySelectorAll(`[data-seat="${seatIndex}"] [data-card-slot]`).forEach((slot, index) => {
      const end = centre(slot.getBoundingClientRect())
      // Both keyframes are needed: a lone keyframe is the end state, which would fly the card back to the pot.
      slot.animate([{ transform: `translate(${start.x - end.x}px, ${start.y - end.y}px) scale(0.4)`, opacity: 0 }, { transform: 'none', opacity: 1 }], {
        duration: timing.dealFlight, delay: Math.max(0, cardDelays[index] - elapsed), easing: 'cubic-bezier(.2, .8, .3, 1)', fill: 'backwards',
      })
    })
  }
}

/** A few chips slide from each rect to the target element and fade out there. */
export function flyChips(layer, from, to, delay = 0) {
  if (!layer || !to || reducedMotion()) return
  const end = centre(to.getBoundingClientRect())
  from.forEach(rect => {
    const start = centre(rect)
    for (let index = 0; index < chipsPerFlight; index++) {
      const chip = document.createElement('i')
      chip.className = `${chipStyles.disc} ${chipStyles[chipColors[index % chipColors.length]]} ${chipStyles.flying}`
      chip.style.left = `${start.x}px`
      chip.style.top = `${start.y}px`
      layer.append(chip)
      const travel = `translate(${end.x - start.x}px, ${end.y - start.y}px)`
      const flight = chip.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: travel, opacity: 1, offset: 0.85 },
        { transform: `${travel} scale(0.5)`, opacity: 0 },
      ], { duration: timing.payFlight, delay: delay + index * chipStagger, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'both' })
      flight.onfinish = () => chip.remove()
      flight.oncancel = () => chip.remove()
    }
  })
}

/** Where every bet sits right now, so the next street can sweep them into the pot after React removes them. */
export function measureBets(table) {
  return table ? [...table.querySelectorAll('[data-bet-seat]')].map(bet => bet.getBoundingClientRect()) : []
}
