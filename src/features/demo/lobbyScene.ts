import * as THREE from 'three'
import { createRenderer, resizeRenderer } from './engine/core/Renderer'
import { TableScene } from './engine/scene/table-scene'
import { Tweens } from './engine/scene/tweens'
import { slotsForPlayers } from './engine/scene/table-layout'
import { BOT_ROSTER } from './engine/meta/bot-roster'
import { disposeObject3D } from './engine/utils/dispose'

/** Decorative lounge only: geometry/lighting from poker-3d, no simulated account or queue. */
export function createLobbyScene(canvas: HTMLCanvasElement): () => void {
  const renderer = createRenderer(canvas)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 80)
  const tweens = new Tweens()
  const table = new TableScene(scene, camera, tweens)
  table.setupPlayers([null, ...BOT_ROSTER.slice(0, 5).map(bot => bot.avatar)], slotsForPlayers(6))
  table.setView('lobby')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let frame = 0, last = 0, elapsed = 0, stopped = false
  function draw(now: number) {
    if (stopped) return
    frame = requestAnimationFrame(draw)
    if (document.hidden || document.querySelector('[aria-modal="true"]') || now - last < 33) return
    const delta = Math.min(.05, (now - last) / 1000)
    last = now
    elapsed += delta
    const resized = resizeRenderer(renderer, camera, 1.25)
    if (reduced.matches && !resized && canvas.dataset.renderStatus === 'ready') return
    tweens.update(delta)
    table.update(delta, elapsed, reduced.matches)
    renderer.render(scene, camera)
    canvas.dataset.renderStatus = 'ready'
  }
  frame = requestAnimationFrame(draw)
  return () => {
    stopped = true
    cancelAnimationFrame(frame)
    disposeObject3D(scene)
    renderer.dispose()
  }
}
