import { useCallback, useEffect, useState } from 'react'

// The caller supplies a memoized loader; each reload aborts stale requests.
export function useResource(loader, interval = 0) {
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState({ data: null, error: '', loading: true })
  const reload = useCallback(() => setRevision(value => value + 1), [])
  useEffect(() => {
    const controller = new AbortController()
    let timer
    async function read() {
      try {
        const data = await loader(controller.signal)
        if (!controller.signal.aborted) setState({ loader, data, error: '', loading: false })
      } catch (error) {
        if (!controller.signal.aborted) setState(current => ({ data: current.loader === loader ? current.data : null, loader, error: error.message || 'Không tải được dữ liệu.', loading: false }))
      } finally {
        if (interval && !controller.signal.aborted) timer = setTimeout(read, interval)
      }
    }
    void read()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [loader, interval, revision])
  return state.loader === loader ? { ...state, reload } : { data: null, loading: true, error: '', reload }
}
