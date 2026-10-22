import { gatewayRequest } from '@/shared/api/gatewayClient'

/** The caller's RANK result: { matchId, place, eloDelta, eloAfter, rewardCoins }; 404 until ranking processes the match. */
export const fetchMatchRewards = (matchId, signal) =>
  gatewayRequest(`/api/ranking/me/matches/${matchId}`, { errorMessage: 'Unable to load your match rewards', signal })
