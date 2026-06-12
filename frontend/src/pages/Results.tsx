import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, Lightbulb, TrendingUp, Send, ArrowLeft, Database } from 'lucide-react'
import Nav from '../components/Nav'
import { useInsights } from '../hooks/useInsights'
import { getEvaluation, getFeatures, getTraining, getEDA } from '../api'
import type { MetricsResult, FeatureImportance, ModelResult, EDAResult } from '../types'
import { useRef } from 'react'

type Tab = 'metrics' | 'eda' | 'insights' | 'recommendations'

export default function ResultsPage() {
  const { runId }                     = useParams<{ runId: string }>()
  const navigate                      = useNavigate()
  const [tab, setTab]                 = useState<Tab>('metrics')
  const [metrics, setMetrics]         = useState<MetricsResult | null>(null)
  const [features, setFeatures]       = useState<FeatureImportance[]>([])
  const [model, setModel]             = useState<ModelResult | null>(null)
  const [eda, setEda]                 = useState<EDAResult | null>(null)
  const [question, setQuestion]       = useState('')
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([])

  const { insights, loading, asking, generate, ask } = useInsights(runId ?? null)

// Track what's already been fetched so switching tabs doesn't re-hit the API
const fetchedRef = useRef(false)

useEffect(() => {
  if (!runId || fetchedRef.current) return
  fetchedRef.current = true

  getEvaluation(runId).then(d => setMetrics(d.evaluation)).catch(() => {})
  getFeatures(runId).then(d  => setFeatures(d.features ?? [])).catch(() => {})
  getTraining(runId).then(d  => setModel(d.training)).catch(() => {})
  getEDA(runId).then(d       => setEda(d.eda)).catch(() => {})
  generate()
}, [runId])
  const handleAsk = async () => {
    if (!question.trim()) return
    const q = question.trim()
    setQuestion('')
    const res = await ask(q)
    if (res) setChatHistory(h => [...h, { q, a: res.answer }])
  }

  if (!runId) { navigate('/'); return null }

  const tabs = [
    { key: 'metrics',         label: 'Metrics',        icon: BarChart2  },
    { key: 'eda',             label: 'Data Profile',   icon: Database   },
    { key: 'insights',        label: 'Insights',       icon: Lightbulb  },
    { key: 'recommendations', label: 'Recommendations', icon: TrendingUp },
  ] as const

  return (
    <div style={{ minHeight: '100vh', background: '#fff8f2' }}>
      <Nav active="Deployments" />

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 140px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'DM Mono, monospace', fontSize: '11px',
              color: '#A78D78', padding: '0 0 16px', letterSpacing: '0.08em',
            }}
          >
            <ArrowLeft size={13} strokeWidth={1.5} />
            New analysis
          </button>

          <h1 style={{
            fontFamily: 'Playfair Display, serif', fontSize: '40px',
            fontWeight: 700, color: '#291C0E', margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}>
            Inference Analysis
          </h1>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '12px',
            color: '#A78D78', margin: '0 0 32px',
          }}>
            Session ID: {runId.slice(0, 8).toUpperCase()} // Model: {model?.model_class ?? '—'}
          </p>
        </motion.div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', borderBottom: '1px solid #BEB5A9', marginBottom: '32px',
        }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 20px', background: 'transparent', border: 'none',
                borderBottom: tab === key ? '2px solid #291C0E' : '2px solid transparent',
                cursor: 'pointer',
                fontFamily: 'DM Mono, monospace', fontSize: '11px',
                fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: tab === key ? '#291C0E' : '#A78D78',
                transition: 'all 0.15s', marginBottom: '-1px',
              }}
            >
              <Icon size={13} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">

          {/* ── METRICS ── */}
          {tab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            >
              {/* Model info grid */}
              {model && (
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '16px', marginBottom: '24px',
                }}>
                  {[
                    { label: 'Model',         value: model.model_class },
                    { label: 'Task',          value: model.task_type   },
                    { label: 'Training Rows', value: model.training_rows.toLocaleString() },
                    { label: 'Features Used', value: String(model.feature_count) },
                  ].map(item => (
                    <div key={item.label} style={{
                      border: '1px solid #BEB5A9', borderRadius: '12px', padding: '20px 24px',
                    }}>
                      <p style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '11px',
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: '#A78D78', margin: '0 0 8px',
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontFamily: 'Playfair Display, serif', fontSize: '28px',
                        fontWeight: 600, color: '#291C0E', margin: 0,
                      }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Performance scores */}
              {metrics && (
                <div style={{
                  border: '1px solid #BEB5A9', borderRadius: '12px',
                  padding: '24px', marginBottom: '24px',
                }}>
                  <p style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '11px',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: '#A78D78', margin: '0 0 20px',
                  }}>
                    Performance Scores
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {Object.entries(metrics)
                      .filter(([k]) => !['classification_report', 'predictions_sample', 'cluster_sizes'].includes(k))
                      .map(([key, val]) => (
                        <div key={key}>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', marginBottom: '8px',
                          }}>
                            <span style={{
                              fontFamily: 'DM Mono, monospace', fontSize: '12px',
                              color: '#291C0E', textTransform: 'uppercase', letterSpacing: '0.08em',
                            }}>
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span style={{
                              fontFamily: 'Playfair Display, serif', fontSize: '20px',
                              fontWeight: 600, color: '#291C0E',
                            }}>
                              {typeof val === 'number'
                                ? val > 1 ? val.toLocaleString() : `${(val * 100).toFixed(1)}%`
                                : String(val)}
                            </span>
                          </div>
                          {typeof val === 'number' && val <= 1 && (
                            <div style={{ height: '3px', background: '#E1D4C2', borderRadius: '2px' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.abs(val) * 100}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                style={{
                                  height: '100%', borderRadius: '2px',
                                  background: val < 0 ? '#A78D78' : '#291C0E',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Feature importance */}
              {features.length > 0 && (
                <div style={{ border: '1px solid #BEB5A9', borderRadius: '12px', padding: '24px' }}>
                  <p style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '11px',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: '#A78D78', margin: '0 0 20px',
                  }}>
                    Feature Importance
                  </p>
                  {features.map((f, i) => (
                    <div key={f.feature} style={{ marginBottom: '16px' }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', marginBottom: '6px',
                      }}>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#291C0E' }}>
                          {f.feature}
                        </span>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#A78D78' }}>
                          {(f.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ height: '3px', background: '#E1D4C2', borderRadius: '2px' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${f.importance * 100}%` }}
                          transition={{ duration: 0.7, delay: i * 0.06, ease: 'easeOut' }}
                          style={{ height: '100%', background: '#6E473B', borderRadius: '2px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── EDA ── */}
          {tab === 'eda' && (
            <motion.div
              key="eda"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            >
              {!eda ? (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#A78D78' }}>
                  Loading data profile...
                </p>
              ) : (
                <>
                  {/* Shape */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: '16px', marginBottom: '24px',
                  }}>
                    {[
                      { label: 'Total Rows',    value: eda.shape.rows.toLocaleString()    },
                      { label: 'Total Columns', value: eda.shape.columns.toLocaleString() },
                    ].map(item => (
                      <div key={item.label} style={{
                        border: '1px solid #BEB5A9', borderRadius: '12px', padding: '20px 24px',
                      }}>
                        <p style={{
                          fontFamily: 'DM Mono, monospace', fontSize: '11px',
                          letterSpacing: '0.12em', textTransform: 'uppercase',
                          color: '#A78D78', margin: '0 0 8px',
                        }}>
                          {item.label}
                        </p>
                        <p style={{
                          fontFamily: 'Playfair Display, serif', fontSize: '32px',
                          fontWeight: 600, color: '#291C0E', margin: 0,
                        }}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Null report */}
                  <div style={{
                    border: '1px solid #BEB5A9', borderRadius: '12px',
                    padding: '24px', marginBottom: '24px',
                  }}>
                    <p style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '11px',
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: '#A78D78', margin: '0 0 16px',
                    }}>
                      Missing Values
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {Object.entries(eda.null_report).map(([col, info]) => (
                        <div key={col}>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', marginBottom: '5px',
                          }}>
                            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#291C0E' }}>
                              {col}
                            </span>
                            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#A78D78' }}>
                              {info.null_count === 0 ? 'clean' : `${info.null_pct}% missing`}
                            </span>
                          </div>
                          <div style={{ height: '2px', background: '#E1D4C2', borderRadius: '2px' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(2, info.null_pct)}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              style={{
                                height: '100%', borderRadius: '2px',
                                background: info.null_count === 0 ? '#6E473B' : '#ba1a1a',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top correlations */}
                  {eda.top_correlations.length > 0 && (
                    <div style={{ border: '1px solid #BEB5A9', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                      <p style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '11px',
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: '#A78D78', margin: '0 0 16px',
                      }}>
                        Top Feature Correlations
                      </p>
                      {eda.top_correlations.map((corr, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', padding: '10px 0',
                          borderBottom: i < eda.top_correlations.length - 1 ? '1px solid #BEB5A9' : 'none',
                        }}>
                          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#291C0E' }}>
                            {corr.col_a} × {corr.col_b}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '80px', height: '2px', background: '#E1D4C2', borderRadius: '2px' }}>
                              <div style={{
                                width: `${corr.correlation * 100}%`, height: '100%',
                                background: corr.correlation > 0.7 ? '#291C0E' : '#6E473B',
                                borderRadius: '2px',
                              }} />
                            </div>
                            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#6E473B', minWidth: '40px', textAlign: 'right' }}>
                              {corr.correlation.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Numeric stats */}
                  {Object.keys(eda.numeric_stats).length > 0 && (
                    <div style={{ border: '1px solid #BEB5A9', borderRadius: '12px', padding: '24px' }}>
                      <p style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '11px',
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: '#A78D78', margin: '0 0 16px',
                      }}>
                        Numeric Column Stats
                      </p>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              {['Column', 'Mean', 'Median', 'Std', 'Min', 'Max', 'Skew'].map(h => (
                                <th key={h} style={{
                                  fontFamily: 'DM Mono, monospace', fontSize: '10px',
                                  letterSpacing: '0.12em', textTransform: 'uppercase',
                                  color: '#A78D78', textAlign: 'left',
                                  padding: '0 16px 12px 0', fontWeight: 500,
                                  borderBottom: '1px solid #BEB5A9',
                                }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(eda.numeric_stats).map(([col, stats], i) => (
                              <tr key={col}>
                                {[col, stats.mean, stats.median, stats.std, stats.min, stats.max, stats.skew].map((v, j) => (
                                  <td key={j} style={{
                                    fontFamily: 'DM Mono, monospace', fontSize: '12px',
                                    color: j === 0 ? '#291C0E' : '#6E473B',
                                    padding: '12px 16px 12px 0',
                                    borderBottom: i < Object.keys(eda.numeric_stats).length - 1
                                      ? '1px solid #BEB5A9' : 'none',
                                  }}>
                                    {typeof v === 'number' ? v.toFixed(2) : v}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── INSIGHTS ── */}
          {tab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            >
              {loading && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '32px', color: '#A78D78',
                  fontFamily: 'DM Mono, monospace', fontSize: '13px',
                }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 16, height: 16,
                      border: '2px solid #E1D4C2', borderTopColor: '#6E473B', borderRadius: '50%',
                    }}
                  />
                  Generating insights...
                </div>
              )}

              {!loading && !insights && (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#A78D78' }}>
                  No insights available. Make sure the backend LLM is running.
                </p>
              )}

              {(insights?.insights ?? []).map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    border: '1px solid #BEB5A9', borderRadius: '12px',
                    padding: '20px 24px', marginBottom: '16px',
                  }}
                >
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', color: '#291C0E', lineHeight: 1.8, marginBottom: '12px' }}>
                    {insight.text.split('\n').map((line, j) => (
                      <p key={j} style={{ margin: '0 0 4px' }}>{line}</p>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#A78D78' }}>
                      source: {insight.source_stat}
                    </span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#6E473B' }}>
                      {(insight.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── RECOMMENDATIONS ── */}
          {tab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            >
              {!insights && (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#A78D78' }}>
                  No recommendations yet. Check the Insights tab first.
                </p>
              )}

              {(insights?.recommendations ?? []).map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    border: '1px solid #BEB5A9',
                    borderLeft: `3px solid ${rec.priority === 'high' ? '#291C0E' : rec.priority === 'medium' ? '#6E473B' : '#A78D78'}`,
                    borderRadius: '12px', padding: '20px 24px', marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', fontWeight: 500, color: '#291C0E', margin: 0, lineHeight: 1.5 }}>
                      {rec.action}
                    </p>
                    <span style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '10px',
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: '#A78D78', whiteSpace: 'nowrap', marginLeft: '16px',
                    }}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#A78D78', lineHeight: 1.6, margin: 0 }}>
                    {rec.rationale}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Ask question — fixed bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,248,242,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid #BEB5A9',
        padding: '12px 24px',
      }}>
        {/* Recent chat */}
        <AnimatePresence>
          {chatHistory.slice(-2).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                maxWidth: '860px', margin: '0 auto 8px',
                padding: '10px 16px',
                background: '#E1D4C2', borderRadius: '8px',
              }}
            >
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#A78D78', margin: '0 0 4px' }}>
                Q: {item.q}
              </p>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#291C0E', lineHeight: 1.6 }}>
                {item.a.split('\n').map((line, j) => (
                  <p key={j} style={{ margin: '0 0 2px' }}>{line}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Input */}
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !asking && handleAsk()}
            placeholder="Query the analytical model..."
            style={{
              flex: 1, padding: '14px 18px',
              background: 'transparent', border: '1px solid #BEB5A9',
              borderRadius: '8px', fontFamily: 'DM Mono, monospace',
              fontSize: '13px', color: '#291C0E', outline: 'none',
            }}
            onFocus={e  => e.target.style.borderColor = '#6E473B'}
            onBlur={e   => e.target.style.borderColor = '#BEB5A9'}
          />
          <button
            onClick={handleAsk}
            disabled={asking || !question.trim()}
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: asking ? '#BEB5A9' : '#291C0E',
              border: 'none', cursor: asking ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s', flexShrink: 0,
            }}
          >
            {asking
              ? <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                />
              : <Send size={16} color="white" strokeWidth={1.5} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}