import { useMemo } from 'react'
import { useCommunity } from '@/features/community'

// ROOM_INVITE notifications received in this session (the socket keeps no history), newest first, one per room.
export function useRoomInvites() {
  const { notifications } = useCommunity()
  return useMemo(() => {
    const rooms = new Set()
    return notifications
      .filter(row => row.type === 'ROOM_INVITE' && row.data?.roomCode && !rooms.has(row.data.roomCode) && rooms.add(row.data.roomCode))
      .map(row => ({ roomCode: row.data.roomCode, inviterId: row.data.inviterId, hasPassword: Boolean(row.data.hasPassword) }))
  }, [notifications])
}
