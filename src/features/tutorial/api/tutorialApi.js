import { gatewayRequest } from '@/shared/api/gatewayClient'
import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

// Signed-in players reach ranking-service through the gateway session cookie; local ?devUser identities
// call the dev service directly through the Vite proxy (like game-table's gameApi).
const call = (path, errorMessage, { devUser, signal, method } = {}) => devUser
  ? request(`${env.gameApiBaseUrl}${path}`, { errorMessage, devUser, signal, method })
  : gatewayRequest(path, { errorMessage, signal, method })

/** { completed, completedAt, rewardCoins }: rewardCoins is what finishing pays, or paid, once per account. */
export const fetchTutorial = identity => call('/api/tutorial/me', 'Unable to load the tutorial', identity)

/** Records the completion and grants the coins once; repeating returns the first completion. */
export const completeTutorial = identity =>
  call('/api/tutorial/complete', 'Unable to finish the tutorial', { ...identity, method: 'POST' })
