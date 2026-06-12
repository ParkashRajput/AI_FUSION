// ── File ──────────────────────────────────────────────────────────────────────
export interface UploadResponse {
  file_id: string
  filename: string
}

// ── Detect ────────────────────────────────────────────────────────────────────
export interface DetectResponse {
  target_column: string
  task_type:     'classification' | 'regression' | 'clustering'
  confidence:    number
  unique_values: number
  dtype:         string
}

// ── Pipeline ──────────────────────────────────────────────────────────────────
export type RunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface PipelineResponse {
  run_id:   string
  status:   RunStatus
  message?: string
}

export interface RunProgress {
  run_id:         string
  file_id:        string
  task_type:      string
  target_col:     string
  status:         RunStatus
  current_stage:  string
  progress_pct:   number
  results:        RunResults
  error:          string | null
}

// ── Results ───────────────────────────────────────────────────────────────────
export interface RunResults {
  eda?:       EDAResult
  model?:     ModelResult
  metrics?:   MetricsResult
  importance?: FeatureImportance[]
  insights?:  InsightResult
}

export interface EDAResult {
  shape:              { rows: number; columns: number }
  null_report:        Record<string, { null_count: number; null_pct: number }>
  column_types:       Record<string, string>
  numeric_stats:      Record<string, NumericStats>
  categorical_stats:  Record<string, CategoricalStats>
  target_distribution: Record<string, number> | HistogramData
  top_correlations:   Correlation[]
}

export interface NumericStats {
  mean: number; median: number; std: number
  min:  number; max:    number; skew: number
}

export interface CategoricalStats {
  unique_count: number
  top_values:   Record<string, number>
}

export interface HistogramData {
  histogram_counts: number[]
  histogram_edges:  number[]
}

export interface Correlation {
  col_a:       string
  col_b:       string
  correlation: number
}

export interface ModelResult {
  model_id:        string
  model_class:     string
  task_type:       string
  target_column:   string
  feature_count:   number
  training_rows:   number
  test_rows:       number
  dropped_columns: string[]
  encoding_map:    Record<string, Record<string, number>>
}

export interface MetricsResult {
  // regression
  r2_score?:  number
  mae?:       number
  rmse?:      number
  // classification
  accuracy?:  number
  f1_score?:  number
  precision?: number
  recall?:    number
  // clustering
  inertia?:          number
  silhouette_score?: number
  cluster_sizes?:    Record<string, number>
}

export interface FeatureImportance {
  feature:    string
  importance: number
}

// ── Insights ──────────────────────────────────────────────────────────────────
export interface InsightResult {
  insights:        Insight[]
  recommendations: Recommendation[]
}

export interface Insight {
  text:        string
  source_stat: string
  confidence:  number
}

export interface Recommendation {
  action:   string
  rationale: string
  priority: 'high' | 'medium' | 'low'
}

export interface AskResponse {
  question: string
  answer:   string
}