import { useCallback } from 'react'
import { useConfirm } from '@/shared/ui'
import { communityApi } from '../api/communityApi'

const leavePrompt = {
  title: 'Leave party?', message: 'You’ll leave this party. To rejoin, you’ll need the code and password from a member.',
  confirmLabel: 'Leave party', icon: 'logout', danger: true,
}
const disbandPrompt = {
  title: 'Disband party?',
  message: 'You’re the host. Leaving disbands the room and removes every member.',
  confirmLabel: 'Leave and disband', icon: 'group_remove', danger: true,
}

/** Asks first, then leaves the party; the leader leaving disbands it. Resolves to the done message, or null if the player stays. */
export function useLeaveParty() {
  const confirm = useConfirm()
  return useCallback(async leader => {
    if (!await confirm(leader ? disbandPrompt : leavePrompt)) return null
    await communityApi.leaveParty()
    return leader ? 'Party disbanded. All members have left.' : 'You left the party.'
  }, [confirm])
}
