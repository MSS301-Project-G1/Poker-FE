import { useEffect } from 'react'
import { devIdentity, rememberDevIdentity } from '@/shared/lib/devIdentity'

// Local development: keep ?devUser for the next room screens of this tab, because links drop the query.
export function useDevUser() {
  const devUser = devIdentity()
  useEffect(() => {
    if (devUser) rememberDevIdentity(devUser)
  }, [devUser])
  return devUser
}
