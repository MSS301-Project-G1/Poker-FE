import { useContext } from 'react'
import { ToastContext } from './ToastContext'

/** Returns notify(message): shows a short status message at the bottom of the screen. */
export function useToast() {
  return useContext(ToastContext)
}
