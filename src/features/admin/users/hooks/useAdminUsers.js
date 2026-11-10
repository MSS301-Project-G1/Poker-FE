import { useEffect, useState } from 'react'
import { fetchAdminUsers } from '../api/adminUserApi'

export function useAdminUsers({ keyword, banned, page, attempt }) {
  const key = JSON.stringify([keyword, banned, page, attempt])
  const [result, setResult] = useState({ key: null, data: null, error: null })
  useEffect(() => {
    const controller = new AbortController()
    fetchAdminUsers({ keyword, banned, page, signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setResult({ key, data, error: null }) })
      .catch(error => { if (!controller.signal.aborted) setResult({ key, data: null, error }) })
    return () => controller.abort()
  }, [keyword, banned, page, key])
  return result.key === key ? { ...result, loading: false } : { data: null, error: null, loading: true }
}
