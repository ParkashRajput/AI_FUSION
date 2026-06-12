import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Nav from '../components/Nav'
import Badge from '../components/Badge'
import { listModels } from '../api'

type TaskFilter = 'all' | 'classification' | 'regression' | 'clustering'

export default function ModelsPage() {
  const navigate                    = useNavigate()
  const [models, setModels]         = useState<Record<string, any>>({})
  const [filter, setFilter]         = useState<TaskFilter>('all')
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    listModels().then(d => {
      setModels(d.models ?? {})
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Re-fetch when filter changes
  useEffect(() => {
    setLoading(true)
    const task = filter === 'all' ? undefined : filter
    listModels(task).then(d => {
      setModels(d.models ?? {})
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filter])

  const FILTERS: TaskFilter[] = ['all', 'classification', 'regression', 'clustering']

  const taskColor: Record<string, string> = {
    classification: '#291C0E',
    regression:     '#6E473B',
    clustering:     '#A78D78',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff8f2' }}>
      <Nav active="Models" />

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '40px' }}
        >
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '11px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: '#A78D78', marginBottom: '12px',
          }}>
            Model Registry
          </p>
          <h1 style={{
            fontFamily: 'Playfair Display, serif', fontSize: '40px',
            fontWeight: 700, color: '#291C0E', margin: '0 0 12px',
            letterSpacing: '-0.02em',
          }}>
            Available Models
          </h1>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '14px',
            color: '#A78D78', margin: 0,
          }}>
            {Object.keys(models).length} model{Object.keys(models).length !== 1 ? 's' : ''} registered
            across {FILTERS.length - 1} task types.
            Upload a dataset to get a recommendation.
          </p>
        </motion.div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily: 'DM Mono, monospace', fontSize: '11px',
                fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                border: '1px solid #BEB5A9',
                background: filter === f ? '#291C0E' : 'transparent',
                color:      filter === f ? '#E1D4C2' : '#A78D78',
                transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Model cards */}
        {loading ? (
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#A78D78' }}>
            Loading registry...
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(models).map(([id, model]: [string, any], i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  border: '1px solid #BEB5A9', borderRadius: '12px',
                  overflow: 'hidden', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#6E473B')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#BEB5A9')}
              >
                {/* Card header */}
                <div
                  onClick={() => setExpanded(expanded === id ? null : id)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <p style={{
                        fontFamily: 'Playfair Display, serif', fontSize: '18px',
                        fontWeight: 600, color: '#291C0E', margin: '0 0 4px',
                      }}>
                        {model.name}
                      </p>
                      <p style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '11px',
                        color: '#A78D78', margin: 0, letterSpacing: '0.04em',
                      }}>
                        {id}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {(model.task_types ?? []).map((t: string) => (
                      <span key={t} style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '10px',
                        fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                        padding: '3px 8px', borderRadius: '4px',
                        background: `${taskColor[t]}18`,
                        color: taskColor[t],
                        border: `1px solid ${taskColor[t]}40`,
                      }}>
                        {t}
                      </span>
                    ))}
                    <ArrowUpRight
                      size={14} color="#A78D78" strokeWidth={1.5}
                      style={{
                        transform: expanded === id ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </div>
                </div>

                {/* Expanded details */}
                {expanded === id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ borderTop: '1px solid #BEB5A9', padding: '20px 24px' }}
                  >
                    <p style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '13px',
                      color: '#4e453e', lineHeight: 1.7, margin: '0 0 20px',
                    }}>
                      {model.description}
                    </p>

                    {/* Hyperparams */}
                    {model.hyperparams && Object.keys(model.hyperparams).length > 0 && (
                      <>
                        <p style={{
                          fontFamily: 'DM Mono, monospace', fontSize: '11px',
                          letterSpacing: '0.12em', textTransform: 'uppercase',
                          color: '#A78D78', margin: '0 0 12px',
                        }}>
                          Hyperparameters
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {Object.entries(model.hyperparams).map(([param, info]: [string, any]) => (
                            <div key={param} style={{
                              display: 'flex', justifyContent: 'space-between',
                              alignItems: 'flex-start', padding: '10px 14px',
                              background: '#F7F0E8', borderRadius: '8px',
                            }}>
                              <div>
                                <span style={{
                                  fontFamily: 'DM Mono, monospace', fontSize: '12px',
                                  fontWeight: 500, color: '#291C0E',
                                }}>
                                  {param}
                                </span>
                                <p style={{
                                  fontFamily: 'DM Mono, monospace', fontSize: '11px',
                                  color: '#A78D78', margin: '2px 0 0',
                                }}>
                                  {info.description}
                                </p>
                              </div>
                              <span style={{
                                fontFamily: 'DM Mono, monospace', fontSize: '11px',
                                color: '#6E473B', marginLeft: '16px', whiteSpace: 'nowrap',
                              }}>
                                default: {String(info.default)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: '40px', padding: '24px',
            border: '1px dashed #BEB5A9', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{
              fontFamily: 'Playfair Display, serif', fontSize: '18px',
              fontWeight: 600, color: '#291C0E', margin: '0 0 4px',
            }}>
              Not sure which model to use?
            </p>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '13px',
              color: '#A78D78', margin: 0,
            }}>
              Upload your dataset and the engine will recommend the best fit automatically.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate('/')}
            style={{ flexShrink: 0, marginLeft: '24px' }}
          >
            Upload Data
          </button>
        </motion.div>

      </main>
    </div>
  )
}