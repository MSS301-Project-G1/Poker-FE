import { useContext } from 'react'
import { ConfirmContext } from './ConfirmContext'

/**
 * Returns confirm(options): opens the app's confirmation popup and resolves true only when the player confirms.
 * Use it instead of window.confirm.
 * @returns {(options: { title: string, message?: string, confirmLabel: string, cancelLabel?: string, icon?: string, danger?: boolean }) => Promise<boolean>}
 */
export function useConfirm() {
  return useContext(ConfirmContext)
}
