import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/features/auth'
import { fetchProfilesByIds } from '@/features/account'
import { Client } from '@stomp/stompjs'
import { env } from '@/shared/config/env'
import { useSound } from '@/shared/audio'
import { communityApi } from './api/communityApi'
import { CommunityContext } from './CommunityContext'

export default function CommunityProvider({ children }) {
  const { user, status } = useAuth()
  // Remount on account changes so private state cannot survive logout.
  return <AccountCommunity key={`${status}:${user?.accountId || ''}`} user={status === 'authenticated' ? user : null}>{children}</AccountCommunity>
}

function AccountCommunity({ user, children }) {
  const { play } = useSound()
  const [panel, setPanel] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [profiles, setProfiles] = useState({})
  const [notifications, setNotifications] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [connection, setConnection] = useState({ social: 'connecting', chat: 'connecting' })
  const accountId = user?.accountId
  const cache = useRef({})
  const pending = useRef(new Set())
  const alive = useRef(true)
  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  useEffect(() => {
    if (!accountId) return
    let stopped = false
    let token = null
    let tokenPromise = null
    const clients = []
    const retries = []
    const received = new Set()
    const status = (name, value) => { if (!stopped) setConnection(previous => ({ ...previous, [name]: value })) }
    async function accessToken() {
      if (token && Date.parse(token.expiresAt) - Date.now() > 30000) return token.accessToken
      if (!tokenPromise) tokenPromise = communityApi.socketToken().then(result => { token = result; return result.accessToken }).finally(() => { tokenPromise = null })
      return tokenPromise
    }
    for (const [name, path, destination] of [['social', env.socialSocketUrl, '/user/queue/notifications'], ['chat', env.chatSocketUrl, '/user/queue/chat']]) {
      const url = new URL(path, window.location.href)
      url.protocol = url.protocol === 'https:' ? 'wss:' : url.protocol === 'http:' ? 'ws:' : url.protocol
      const client = new Client({ brokerURL: url.href, reconnectDelay: 5000, connectionTimeout: 8000, heartbeatIncoming: 10000, heartbeatOutgoing: 10000 })
      client.beforeConnect = async () => {
        try {
          const jwt = await accessToken()
          if (stopped) return
          client.connectHeaders = { Authorization: `Bearer ${jwt}` }
        } catch {
          status(name, 'offline')
          // Do not open an unauthenticated socket when the token request fails.
          await client.deactivate()
          if (!stopped) retries.push(setTimeout(() => { if (!stopped) client.activate() }, 5000))
        }
      }
      client.onConnect = () => {
        if (stopped) { void client.deactivate(); return }
        status(name, 'connected')
        client.subscribe(destination, frame => {
          if (stopped) return
          try {
            const payload = JSON.parse(frame.body)
            const messageKey = `${name}:${payload.eventId || payload.id}`
            if (received.has(messageKey)) return
            received.add(messageKey)
            if (received.size > 1000) received.delete(received.values().next().value)
            if (name === 'social' && payload.eventId && typeof payload.title === 'string') {
              play('turn')
              setNotifications(rows => [payload, ...rows.filter(row => row.eventId !== payload.eventId)].slice(0, 100))
            } else if (name === 'chat' && payload.id && payload.conversationId && typeof payload.content === 'string') {
              play(payload.senderId === accountId ? 'chip' : 'card')
              setChatMessages(rows => [...rows.filter(row => row.id !== payload.id), payload].slice(-200))
            }
          } catch { /* Ignore malformed frames; REST remains available. */ }
        })
      }
      client.onWebSocketClose = () => status(name, 'offline')
      client.onWebSocketError = () => status(name, 'offline')
      client.onStompError = () => { token = null; status(name, 'offline'); void client.forceDisconnect() }
      client.activate()
      clients.push(client)
    }
    return () => { stopped = true; retries.forEach(clearTimeout); clients.forEach(client => { void client.deactivate() }) }
  }, [accountId, play])

  const loadProfiles = useCallback(async ids => {
    const unique = [...new Set(ids)].filter(id => id && !cache.current[id] && !pending.current.has(id))
    if (!user || !unique.length) return
    unique.forEach(id => pending.current.add(id))
    try {
      const result = await fetchProfilesByIds(unique)
      if (!alive.current) return
      const rows = Array.isArray(result) ? result : Object.values(result || {})
      const next = Object.fromEntries(rows.filter(Boolean).map(row => [row.accountId || row.id, row]))
      cache.current = { ...cache.current, ...next }
      setProfiles(cache.current)
    } catch {
      // IDs and default avatars remain available if the profile service fails.
    } finally { unique.forEach(id => pending.current.delete(id)) }
  }, [user])
  const openChat = useCallback(row => { setConversation(row); setPanel('chat') }, [])
  const clearChat = useCallback(() => setConversation(null), [])
  const value = useMemo(() => ({ user, panel, setPanel, conversation, openChat, clearChat, profiles, loadProfiles, notifications, chatMessages, connection }), [user, panel, conversation, openChat, clearChat, profiles, loadProfiles, notifications, chatMessages, connection])
  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>
}
