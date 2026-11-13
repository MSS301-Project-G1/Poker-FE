// Moderation actions of auth-service POST /api/admin/users/{id}/moderation, in display order.
export const moderationActions = [
  { action: 'RESET_DISPLAY_NAME', label: 'Reset display name', icon: 'badge',
    description: user => `Renames the player to “Player ${user.playerCode}”. They can choose a new name afterwards.`,
    available: user => user.displayName !== `Player ${user.playerCode}` },
  { action: 'REMOVE_AVATAR', label: 'Remove avatar', icon: 'hide_image',
    description: () => 'Restores the default avatar. An uploaded image is deleted.',
    available: user => user.customAvatar },
  { action: 'CLEAR_BIO', label: 'Clear bio', icon: 'format_clear',
    description: () => 'Removes the bio text. It stays visible in the moderation history.',
    available: user => Boolean(user.bio) },
  { action: 'REVOKE_SESSIONS', label: 'Sign out everywhere', icon: 'logout',
    description: () => 'Ends every session; the player must sign in again on every device.',
    available: () => true },
  { action: 'SEND_PASSWORD_RESET', label: 'Send password reset email', icon: 'lock_reset',
    description: user => `Emails a one-time code to ${user.email}. Admins never set passwords.`,
    available: user => user.emailVerified },
  { action: 'RESEND_VERIFICATION', label: 'Resend verification email', icon: 'mark_email_unread',
    description: user => `Sends a new verification code to ${user.email}.`,
    available: user => !user.emailVerified },
]

export const actionLabel = action => moderationActions.find(item => item.action === action)?.label || action
