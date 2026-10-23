import * as THREE from 'three'
import { createRenderer, resizeRenderer } from './engine/core/Renderer'
import { TableScene } from './engine/scene/table-scene'
import { Tweens } from './engine/scene/tweens'
import { disposeObject3D } from './engine/utils/dispose'
import type { AvatarStyle } from './engine/meta/bot-roster'
import type { Card } from './engine/poker/cards'

type ServerCard = { rank: string; suit: string }
type Seat = { accountId: string; seatIndex: number; chips: number; streetBet: number; cards: ServerCard[]; holeCardCount: number; folded: boolean; eliminated: boolean; leftEarly: boolean }
type Snapshot = { tableId: string; accountId: string; handNumber: number; actionSequence: number; seats: Seat[]; board: ServerCard[]; pot: number; actorSeat: number; dealerSeat: number; street: string }
const ranks = ['TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING', 'ACE']
const suits = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS']
const accessories: AvatarStyle['accessory'][] = ['tophat', 'shades', 'crown', 'headphones', 'beanie', 'visor']
const bodies = ['#b0129b', '#6c2399', '#433255', '#741968', '#352559', '#725073']
function cardOf(card: ServerCard | undefined): Card | null {
  if (!card) return null
  const rank = ranks.indexOf(card.rank), suit = suits.indexOf(card.suit)
  return rank >= 0 && suit >= 0 ? { rank: rank + 2, suit } : null
}
function styleOf(accountId: string): AvatarStyle {
  const hash = [...accountId].reduce((value, c) => (value * 31 + c.charCodeAt(0)) >>> 0, 0)
  return { body: bodies[hash % bodies.length], skin: '#efc2a2', accent: '#e5c457', accessory: accessories[hash % accessories.length] }
}

export function createLiveTableScene(canvas: HTMLCanvasElement, root: HTMLElement, intro: boolean, onReady: () => void, onEntered: () => void) {
  const renderer = createRenderer(canvas)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 80)
  const tweens = new Tweens()
  const table = new TableScene(scene, camera, tweens)
  table.useCompactTableCamera()
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  table.enterTable(intro && !reduced.matches ? 3.2 : 0)
  let frame = 0, last = 0, elapsed = 0, stopped = false, ready = false, entered = false
  let roster = '', hand = -1, sequence = -1
  let snapshot: Snapshot | null = null, seats: Seat[] = []
  function update(next: Snapshot) {
    snapshot = next
    const sorted = [...next.seats].sort((a, b) => a.seatIndex - b.seatIndex)
    const hero = sorted.findIndex(seat => seat.accountId === next.accountId)
    seats = hero < 0 ? sorted : [...sorted.slice(hero), ...sorted.slice(0, hero)]
    const key = seats.map(seat => seat.accountId).join(',')
    if (key !== roster) {
      tweens.flush()
      table.setupPlayers(seats.map(seat => seat.accountId === next.accountId ? null : styleOf(seat.accountId)), seats.map((_, index) => index * 6 / seats.length))
      roster = key
      sequence = -1
    }
    if (sequence === next.actionSequence && hand === next.handNumber) return
    tweens.flush()
    const freshHand = hand !== next.handNumber
    if (freshHand) table.clearHand()
    table.syncLiveCards(seats.map(seat => ({ ...seat, cards: (seat.cards || []).map(cardOf) })), next.board.map(cardOf).filter((card): card is Card => Boolean(card)), !reduced.matches)
    table.layoutChips(seats.map(seat => seat.chips), seats.map(seat => ['HAND_FINISHED', 'FINISHED'].includes(next.street) ? 0 : seat.streetBet), next.pot)
    const dealer = seats.findIndex(seat => seat.seatIndex === next.dealerSeat)
    if (dealer >= 0) table.moveDealer(dealer)
    table.setActor(['HAND_FINISHED', 'FINISHED'].includes(next.street) ? -1 : seats.findIndex(seat => seat.seatIndex === next.actorSeat))
    hand = next.handNumber
    sequence = next.actionSequence
    canvas.dataset.actionSequence = String(sequence)
    canvas.dataset.pot = String(next.pot)
  }
  function project(element: HTMLElement | null, point: THREE.Vector3) {
    if (!element) return
    point.project(camera)
    const x = Math.max(8, Math.min(92, (point.x + 1) * 50))
    const y = Math.max(6, Math.min(94, (-point.y + 1) * 50))
    Object.assign(element.style, { left: `${x}%`, top: `${y}%`, right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)' })
  }
  function draw(now: number) {
    if (stopped) return
    frame = requestAnimationFrame(draw)
    if (document.hidden || now - last < 33) return
    const delta = last ? Math.min(.05, (now - last) / 1000) : 1 / 30
    last = now
    elapsed += delta
    resizeRenderer(renderer, camera, 1.5)
    tweens.update(delta)
    if (reduced.matches && table.entering) table.finishEntrance()
    table.update(delta, elapsed, reduced.matches)
    renderer.render(scene, camera)
    canvas.dataset.renderStatus = 'ready'
    canvas.dataset.cameraPhase = table.entering ? 'entering' : 'playing'
    root.dataset.cameraPhase = canvas.dataset.cameraPhase
    canvas.dataset.cameraHeight = camera.position.y.toFixed(3)
    if (snapshot) seats.forEach((seat, index) => {
      const element = root.querySelector<HTMLElement>(`[data-seat="${seat.seatIndex}"]`)
      if (camera.aspect < .9 && element) {
        // Compact name plates sit around the mobile viewport instead of overlapping on the small felt.
        const angle = index / seats.length * Math.PI * 2
        Object.assign(element.style, { left: `${50 - Math.sin(angle) * 32}%`, top: `${50 + Math.cos(angle) * 34}%`, right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)' })
      } else project(element, table.labelAnchor(index))
    })
    project(root.querySelector('[data-live-board]'), table.potAnchor())
    if (!ready) { ready = true; onReady() }
    if (!table.entering && !entered) { entered = true; onEntered() }
  }
  frame = requestAnimationFrame(draw)
  return {
    update,
    skip: () => table.finishEntrance(),
    dispose: () => {
      stopped = true
      cancelAnimationFrame(frame)
      table.prepareDispose()
      disposeObject3D(scene)
      renderer.dispose()
      root.querySelectorAll<HTMLElement>('[data-seat], [data-live-board]').forEach(element => {
        for (const key of ['left', 'top', 'right', 'bottom', 'transform']) element.style.removeProperty(key)
      })
    },
  }
}
