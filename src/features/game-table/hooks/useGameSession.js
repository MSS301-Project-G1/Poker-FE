import { useEffect, useReducer, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { fetchActiveTable, fetchTable, gameSocketUrl } from '../api/gameApi'

const initial = { snapshot: null, tableId: null, phase: 'loading', connection: 'connecting', error: '', pending: false }
// Refusals of a taunt sound; they never concern the game, so a pending action keeps waiting for its answer.
const tauntErrorCodes = new Set(['GAME_TAUNT_COOLDOWN', 'GAME_TAUNT_UNAVAILABLE'])

function reducer(state, event) {
  if (event.type === 'snapshot') {
    if (state.snapshot && event.value.actionSequence < state.snapshot.actionSequence) return state
    return { ...state, phase: 'ready', snapshot: { ...event.value, receivedAt: Date.now() }, pending: false,
      error: state.snapshot?.actionSequence === event.value.actionSequence ? state.error : '' }
  }
  if (event.type === 'error') return { ...state, error: event.error, pending: false }
  return { ...state, ...event.value }
}

/** onTaunt receives { accountId, productId, soundUrl } for every taunt at the table; onTauntError the refusal message. */
export function useGameSession({ tableId, devUser, getAccessToken, onTaunt, onTauntError }) {
  const [state, dispatch] = useReducer(reducer, initial)
  const clientRef = useRef(null)
  const sequenceSent = useRef(null)
  // Kept in a ref so new handlers never reconnect the socket.
  const tauntHandlers = useRef({ onTaunt, onTauntError })
  useEffect(() => { tauntHandlers.current = { onTaunt, onTauntError } })

  useEffect(() => {
    let disposed = false
    let client
    let syncInterval
    let acknowledgementTimer
    const abort = new AbortController()
    const receive = (message) => {
      try {
        const value = JSON.parse(message.body)
        if (!value.tableId) throw new Error('Invalid table update.')
        clearTimeout(acknowledgementTimer)
        sequenceSent.current = null
        dispatch({ type: 'snapshot', value })
      } catch (error) { dispatch({ type: 'error', error: error.message }) }
    }
    async function start() {
      try {
        const accessToken = await getAccessToken()
        if (!accessToken && !devUser) {
          dispatch({ value: { phase: 'empty', connection: 'offline', error: 'Sign in to reconnect to your table.' } })
          return
        }
        const identity = { devUser, signal: abort.signal }
        const id = tableId || (await fetchActiveTable(identity))?.tableId
        if (!id) { dispatch({ value: { phase: 'empty', connection: 'offline' } }); return }
        const snapshot = await fetchTable(id, identity)
        if (disposed) return
        dispatch({ type: 'snapshot', value: snapshot })
        dispatch({ value: { tableId: id } })
        client = new Client({
          brokerURL: gameSocketUrl(), reconnectDelay: 2000, connectionTimeout: 8000,
          heartbeatIncoming: 0, heartbeatOutgoing: 10000,
          beforeConnect: async () => {
            const token = await getAccessToken()
            client.connectHeaders = devUser ? { devUser } : token ? { Authorization: `Bearer ${token}` } : {}
          },
          onConnect: () => {
            if (disposed) return
            dispatch({ value: { connection: 'connected', pending: false, error: '' } })
            client.subscribe(`/user/queue/tables/${id}`, receive)
            client.subscribe(`/user/queue/tables/${id}/taunts`, message => {
              let taunt
              try { taunt = JSON.parse(message.body) } catch { return }
              tauntHandlers.current.onTaunt?.(taunt)
            })
            client.subscribe('/user/queue/game-errors', message => {
              let payload
              try { payload = JSON.parse(message.body) } catch { payload = { message: 'Unable to perform that action.' } }
              if (tauntErrorCodes.has(payload.code)) {
                tauntHandlers.current.onTauntError?.(payload.message)
                return
              }
              clearTimeout(acknowledgementTimer)
              sequenceSent.current = null
              dispatch({ type: 'error', error: payload.message })
              client.publish({ destination: `/app/tables/${id}/sync` })
            })
            client.publish({ destination: `/app/tables/${id}/sync` })
            clearInterval(syncInterval)
            syncInterval = window.setInterval(() => {
              if (client.connected) client.publish({ destination: `/app/tables/${id}/sync` })
            }, 15000)
          },
          onStompError: frame => {
            let error
            try { error = JSON.parse(frame.body).message } catch { error = frame.headers.message || 'Game connection rejected.' }
            dispatch({ value: { connection: 'rejected', error, pending: false } })
            client.reconnectDelay = 0
            void client.deactivate()
          },
          onWebSocketClose: () => {
            clearInterval(syncInterval)
            clearTimeout(acknowledgementTimer)
            if (!disposed) dispatch({ value: { connection: client.reconnectDelay ? 'reconnecting' : 'rejected', pending: false } })
          },
          onWebSocketError: () => {
            if (!disposed) dispatch({ type: 'error', error: 'Connection interrupted. Reconnecting…' })
          },
        })
        clientRef.current = {
          client, id,
          waitForAcknowledgement: () => {
            acknowledgementTimer = window.setTimeout(() => {
              dispatch({ type: 'error', error: 'Waiting for the server. Refreshing table state…' })
              if (client.connected) client.publish({ destination: `/app/tables/${id}/sync` })
            }, 8000)
          },
        }
        client.activate()
      } catch (error) {
        if (!disposed && error.name !== 'AbortError') dispatch({ value: { phase: 'error', error: error.message, connection: 'offline' } })
      }
    }
    void start()
    return () => {
      disposed = true
      abort.abort()
      clearInterval(syncInterval)
      clearTimeout(acknowledgementTimer)
      clientRef.current = null
      if (client) void client.deactivate()
    }
  }, [tableId, devUser, getAccessToken])

  const send = (type, amount) => {
    const active = clientRef.current
    const snapshot = state.snapshot
    if (!active?.client.connected || !snapshot?.legalActions.includes(type)
        || sequenceSent.current === snapshot.actionSequence) return
    const body = { type, actionSequence: snapshot.actionSequence, ...(type === 'RAISE' ? { amount } : {}) }
    sequenceSent.current = snapshot.actionSequence
    dispatch({ value: { pending: true, error: '' } })
    active.client.publish({ destination: `/app/tables/${active.id}/action`, body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })
    active.waitForAcknowledgement()
  }

  // Plays an owned taunt sound for the table; the sender hears it when the server sends it back to every seat.
  const sendTaunt = productId => {
    const active = clientRef.current
    if (!active?.client.connected) return
    active.client.publish({ destination: `/app/tables/${active.id}/taunt`, body: JSON.stringify({ productId }), headers: { 'content-type': 'application/json' } })
  }

  return { ...state, send, sendTaunt }
}
