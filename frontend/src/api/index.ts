import axios from 'axios'
import type {
  UploadResponse, DetectResponse, PipelineResponse,
  RunProgress, EDAResult, ModelResult, MetricsResult,
  FeatureImportance, InsightResult, AskResponse
} from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/upload/', form)
  return data
}

export const previewFile = async (fileId: string) => {
  const { data } = await api.get(`/upload/${fileId}/preview`)
  return data
}

// ── Detect ────────────────────────────────────────────────────────────────────
export const detectFile = async (fileId: string): Promise<DetectResponse> => {
  const { data } = await api.post(`/detect/`, null, { params: { file_id: fileId } })
  return data
}

// ── Pipeline ──────────────────────────────────────────────────────────────────
export const triggerAutoPipeline = async (
  fileId: string, targetCol: string, taskType: string
): Promise<PipelineResponse> => {
  const { data } = await api.post('/pipeline/', null, {
    params: { file_id: fileId, target_col: targetCol, task_type: taskType }
  })
  return data
}

export const triggerManualPipeline = async (
  fileId: string, model: string, targetColumn: string, taskType: string
): Promise<PipelineResponse> => {
  const { data } = await api.post('/pipeline/manual', null, {
    params: { file_id: fileId, model, target_column: targetColumn, task_type: taskType }
  })
  return data
}

export const getRunStatus = async (runId: string): Promise<RunProgress> => {
  const { data } = await api.get(`/pipeline/${runId}`)
  return data
}

export const overrideDetection = async (fileId: string, taskType: string, targetColumn: string) => {
  const { data } = await api.patch('/detect/', null, {
    params: { file_id: fileId, task_type: taskType, target_column: targetColumn }
  })
  return data
}


// ── Runs ──────────────────────────────────────────────────────────────────────

export const getTraining = async (runId: string): Promise<{ training: ModelResult }> => {
  const { data } = await api.get(`/runs/${runId}/training`)
  return { training: data.training ?? data }
}

export const getEvaluation = async (runId: string): Promise<{ evaluation: MetricsResult }> => {
  const { data } = await api.get(`/runs/${runId}/evaluation`)
  return { evaluation: data.evaluation ?? data }
}

export const getFeatures = async (runId: string): Promise<{ features: FeatureImportance[] }> => {
  const { data } = await api.get(`/runs/${runId}/features`)
  return { features: Array.isArray(data) ? data : (data.features ?? []) }
}

export const getEDA = async (runId: string): Promise<{ eda: EDAResult }> => {
  const { data } = await api.get(`/runs/${runId}/eda`)
  return { eda: data.eda ?? data }
}

export const cancelRun = async (runId: string) =>
  (await api.post(`/pipeline/${runId}/cancel`)).data

export const retryRun = async (runId: string) =>
  (await api.post(`/pipeline/${runId}/retry`)).data


// ── Insights ──────────────────────────────────────────────────────────────────
export const generateInsights = async (runId: string): Promise<InsightResult> => {
  // Step 1 — build EDA context (no LLM)
  await api.post(`/insights/${runId}/generate`)
  // Step 2 — run LLM narrative and get structured result
  const { data } = await api.post(`/insights/${runId}/narrate`)
  return data
}

export const getInsights = async (runId: string): Promise<InsightResult> => {
  const { data } = await api.get(`/insights/${runId}`)
  return data
}

export const askQuestion = async (runId: string, question: string): Promise<AskResponse> => {
  const { data } = await api.post(`/insights/${runId}/ask`, null, {
    params: { question }
  })
  return data
}



// ── Models ────────────────────────────────────────────────────────────────────
export const listModels     = async (taskType?: string) => (await api.get('/models/', { params: { task_type: taskType } })).data
export const recommendModel = async (fileId: string)   => (await api.get('/models/recommend', { params: { file_id: fileId } })).data