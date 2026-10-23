import { useEffect, useRef } from 'react'
import { createLobbyScene } from './lobbyScene'

export default function LobbySceneCanvas() {
  const canvas = useRef(null)
  useEffect(() => {
    try { return createLobbyScene(canvas.current) } catch (error) {
      canvas.current.dataset.renderStatus = 'unavailable'
      canvas.current.dataset.renderError = error.message
      // The lounge remains usable on browsers without WebGL.
    }
  }, [])
  return <canvas ref={canvas} data-testid="lobby-3d-scene" aria-hidden="true" style={{ width: '100%', height: '100%', display: 'block' }} />
}
