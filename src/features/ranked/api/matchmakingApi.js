import { gatewayRequest } from '@/shared/api/gatewayClient'

const queuePath = mode => `/api/matchmaking/${mode === 'NORMAL' ? 'normal' : 'rank'}`
export const fetchQueueStatus = (mode, signal) => gatewayRequest(`${queuePath(mode)}/status`, { signal })
export const joinQueue = mode => gatewayRequest(`${queuePath(mode)}/join`, { method: 'POST' })
export const leaveQueue = mode => gatewayRequest(`${queuePath(mode)}/leave`, { method: 'DELETE' })
export const acceptProposal = id => gatewayRequest(`/api/matchmaking/proposals/${id}/accept`, { method: 'POST' })
export const declineProposal = id => gatewayRequest(`/api/matchmaking/proposals/${id}/decline`, { method: 'POST' })
