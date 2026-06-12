import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DetectResponse } from '../types'

interface RunHistoryEntry {
  runId:     string
  fileId:    string
  filename:  string
  taskType:  string
  targetCol: string
  modelId:   string
  timestamp: string
}

interface AppState {
  fileId:   string | null
  filename: string
  detected: DetectResponse | null
  runId:    string | null
  history:  RunHistoryEntry[]

  setUpload:    (fileId: string, filename: string, detected: DetectResponse) => void
  setRunId:     (runId: string, taskType: string, targetCol: string, modelId: string) => void
  resumeRun:    (entry: RunHistoryEntry) => void
  reset:        () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      fileId:   null,
      filename: '',
      detected: null,
      runId:    null,
      history:  [],

      setUpload: (fileId, filename, detected) =>
        set({ fileId, filename, detected, runId: null }),

      setRunId: (runId, taskType, targetCol, modelId) => {
        const { fileId, filename } = get()
        set({ runId })
        if (fileId) {
          const entry: RunHistoryEntry = {
            runId, fileId, filename, taskType,
            targetCol, modelId,
            timestamp: new Date().toLocaleString(),
          }
          set(state => ({
            history: [entry, ...state.history.filter(h => h.runId !== runId)].slice(0, 10)
          }))
        }
      },

      resumeRun: (entry) =>
        set({ fileId: entry.fileId, filename: entry.filename, runId: entry.runId }),

      reset: () =>
        set({ fileId: null, filename: '', detected: null, runId: null }),
    }),
    {
      name: 'ai-fusion-state',
    }
  )
)