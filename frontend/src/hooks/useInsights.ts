import { useState } from 'react'
import { generateInsights, askQuestion , getInsights} from '../api'
import type { InsightResult, AskResponse } from '../types'

export function useInsights(runId: string | null) {
  const [insights, setInsights]   = useState<InsightResult | null>(null)
  const [loading, setLoading]     = useState(false)
  const [asking, setAsking]       = useState(false)
  const [answer, setAnswer]       = useState<AskResponse | null>(null)
  const [error, setError]         = useState<string | null>(null)

const generate = async () => {
  if (!runId) return
  try {
    setLoading(true)
    setError(null)

    // Check cache first — if insights already exist, use them
    try {
      const cached = await getInsights(runId)
      if (cached?.insights?.length > 0) {
        setInsights(cached)
        return
      }
    } catch {
      // Not cached yet — fall through to generate
    }

    // Not cached — run full generate + narrate
    const data = await generateInsights(runId)
    setInsights(data)
  } catch (e: any) {
    setError(e.response?.data?.detail || e.message)
  } finally {
    setLoading(false)
  }
}

  const ask = async (question: string) => {
    if (!runId) return
    try {
      setAsking(true)
      setError(null)
      const data = await askQuestion(runId, question)
      setAnswer(data)
      return data
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setAsking(false)
    }
  }

  return { insights, loading, asking, answer, error, generate, ask }
}