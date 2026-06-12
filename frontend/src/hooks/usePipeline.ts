import { useState, useEffect, useRef } from 'react'
import { getRunStatus } from '../api'
import type { RunProgress } from '../types'

// Polls GET /pipeline/{runId} every 2 seconds until status is
// completed, failed or cancelled — then stops automatically
export function usePipeline(runId: string | null) {
  const [run, setRun]       = useState<RunProgress | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const intervalRef         = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!runId) return

    const poll = async () => {
      try {
        const data = await getRunStatus(runId)
        setRun(data)
        if (['completed', 'failed', 'cancelled'].includes(data.status)) {
          clearInterval(intervalRef.current!)
        }
      } catch (e: any) {
        setError(e.message)
        clearInterval(intervalRef.current!)
      }
    }

    poll()
    intervalRef.current = setInterval(poll, 2000)
    return () => clearInterval(intervalRef.current!)
  }, [runId])

  return { run, error }
}