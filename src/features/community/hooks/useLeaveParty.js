import { useCallback } from 'react'
import { useConfirm } from '@/shared/ui'
import { communityApi } from '../api/communityApi'

const leavePrompt = {
  title: 'Rời nhóm?', message: 'Bạn sẽ rời nhóm chơi này. Muốn vào lại, bạn cần mã và mật khẩu từ thành viên trong nhóm.',
  confirmLabel: 'Rời nhóm', icon: 'logout', danger: true,
}
const disbandPrompt = {
  title: 'Giải tán nhóm?',
  message: 'Bạn là chủ phòng. Rời nhóm sẽ giải tán phòng và đưa toàn bộ thành viên ra khỏi nhóm.',
  confirmLabel: 'Rời và giải tán', icon: 'group_remove', danger: true,
}

/** Asks first, then leaves the party; the leader leaving disbands it. Resolves to the done message, or null if the player stays. */
export function useLeaveParty() {
  const confirm = useConfirm()
  return useCallback(async leader => {
    if (!await confirm(leader ? disbandPrompt : leavePrompt)) return null
    await communityApi.leaveParty()
    return leader ? 'Đã giải tán nhóm. Toàn bộ thành viên đã rời nhóm.' : 'Đã rời nhóm.'
  }, [confirm])
}
