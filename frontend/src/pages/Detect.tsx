import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, AlertTriangle, FileJson, ArrowLeft } from 'lucide-react'
import Nav from '../components/Nav'
import Badge from '../components/Badge'
import { triggerAutoPipeline, triggerManualPipeline, listModels,previewFile } from '../api'
import { useAppStore } from '../store/appStore'


export default function DetectPage() {
  const { fileId }                        = useParams<{ fileId: string }>()
  const navigate                          = useNavigate()
  const { detected, filename, setRunId }  = useAppStore()

  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [mode, setMode]                   = useState<'auto' | 'manual'>('auto')
  const [models, setModels]               = useState<Record<string, any>>({})
  const [selectedModel, setSelectedModel] = useState('')
  const [taskOverride, setTaskOverride]   = useState('')
  const [preview, setPreview] = useState<Record<string, any> | null>(null)
  const [overrideTarget, setOverrideTarget] = useState('')        // ← ADD HERE
  const [showOverride, setShowOverride]     = useState(false)

  useEffect(() => {
  if (!detected) return
  setTaskOverride(detected.task_type)
  listModels(detected.task_type).then(d => {
    const m = d.models ?? {}
    setModels(m)
    setSelectedModel(Object.keys(m)[0] ?? '')
  })
  // ADD THIS:
  if (fileId) {
    previewFile(fileId).then(d => setPreview(d.preview)).catch(() => {})
  }
  setOverrideTarget(detected.target_column)
}, [detected, fileId])


  // Guard — if no detected data in store, go back to upload
  if (!detected || !fileId) {
    navigate('/')
    return null
  }

  const handleRun = async () => {
    try {
      setLoading(true)
      setError(null)

     const effectiveTask   = taskOverride   || detected.task_type
const effectiveTarget = overrideTarget || detected.target_column

const result = mode === 'auto'
  ? await triggerAutoPipeline(fileId, effectiveTarget, effectiveTask)
  : await triggerManualPipeline(fileId, selectedModel, effectiveTarget, effectiveTask)

setRunId(result.run_id, effectiveTask, effectiveTarget, selectedModel || 'auto')
      navigate(`/pipeline/${result.run_id}`)
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message)
      setLoading(false)
    }
  }

  const roleRows = [
    { entity: detected.target_column, role: 'PRIMARY_ACTOR' },
    { entity: detected.task_type,     role: 'TASK_TYPE'     },
    { entity: detected.dtype,         role: 'DATA_ORIGIN'   },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fff8f2' }}>
      <Nav active="Datasets" />

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Breadcrumb + back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <span style={{
            fontFamily: 'DM Mono, monospace', fontSize: '11px',
            letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A78D78',
          }}>
            Analysis Pipeline / Inference
          </span>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'DM Mono, monospace', fontSize: '11px',
              letterSpacing: '0.08em', color: '#A78D78', padding: '4px 8px',
            }}
          >
            <ArrowLeft size={13} strokeWidth={1.5} />
            New upload
          </button>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: 'Playfair Display, serif', fontSize: '32px',
            fontWeight: 600, color: '#291C0E', margin: '0 0 32px',
            letterSpacing: '-0.02em',
          }}
        >
          Detection & Contextualization
        </motion.h1>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          style={{
            border: '1px solid #BEB5A9', borderRadius: '12px',
            background: '#fff8f2', overflow: 'hidden',
          }}
        >
          {/* Card header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderBottom: '1px solid #BEB5A9',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Badge label={detected.task_type.toUpperCase()} variant="active" />
              <div>
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '11px',
                  color: '#A78D78', letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  Confidence Ratio
                </span>
                <div style={{
                  width: '120px', height: '2px', background: '#E1D4C2',
                  borderRadius: '2px', marginTop: '4px',
                }}>
                  <div style={{
                    width: `${detected.confidence * 100}%`, height: '100%',
                    background: '#6E473B', borderRadius: '2px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#6E473B',
                }}>
                  {(detected.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#A78D78',
            }}>
              <FileJson size={13} strokeWidth={1.5} />
              {filename.toUpperCase()}
            </div>
          </div>

          {/* Warning */}
          <div style={{
            margin: '20px 24px',
            border: '1px solid #BEB5A9', borderRadius: '8px',
            padding: '14px 16px',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
          }}>
            <AlertTriangle size={14} color="#A78D78" strokeWidth={1.5} style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '13px',
              color: '#4e453e', margin: 0, lineHeight: 1.6,
            }}>
              Confidence at {(detected.confidence * 100).toFixed(0)}% — schema inferred from{' '}
              {detected.unique_values} unique values. Pipeline will auto-select the optimal
              model for <strong>{detected.task_type}</strong>.
            </p>
          </div>

            {/* Data preview */}
{preview && typeof preview === 'object' && !Array.isArray(preview) && (
  <div style={{ margin: '0 24px 20px', overflowX: 'auto' }}>
    <p style={{
      fontFamily: 'DM Mono, monospace', fontSize: '11px',
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: '#A78D78', margin: '0 0 10px',
    }}>
      Data Preview
    </p>
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
      <thead>
        <tr>
          {Object.keys(Object.values(preview)[0] as any).map(col => (
            <th key={col} style={{
              fontFamily: 'DM Mono, monospace', fontSize: '10px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: col === detected?.target_column ? '#6E473B' : '#A78D78',
              textAlign: 'left', padding: '6px 12px 6px 0',
              borderBottom: '1px solid #BEB5A9',
              whiteSpace: 'nowrap',
            }}>
              {col} {col === detected?.target_column ? '▸' : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.values(preview).slice(0, 5).map((row: any, i) => (
          <tr key={i}>
            {Object.values(row).map((val: any, j) => (
              <td key={j} style={{
                fontFamily: 'DM Mono, monospace', fontSize: '11px',
                color: '#291C0E', padding: '6px 12px 6px 0',
                borderBottom: '1px solid #BEB5A9',
                whiteSpace: 'nowrap', maxWidth: '120px',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {String(val)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <p style={{
      fontFamily: 'DM Mono, monospace', fontSize: '10px',
      color: '#BEB5A9', margin: '6px 0 0',
    }}>
      Showing 5 rows · target column marked ▸
    </p>
  </div>
  )}


          {/* Entity table */}
          <div style={{ padding: '0 24px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              padding: '8px 0', borderBottom: '1px solid #BEB5A9',
            }}>
              {['Entity Identifier', 'Contextual Role'].map(h => (
                <span key={h} style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '11px',
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A78D78',
                }}>
                  {h}
                </span>
              ))}
            </div>
            {roleRows.map((row, i) => (
              <motion.div
                key={row.role}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr auto',
                  alignItems: 'center', padding: '14px 0',
                  borderBottom: i < roleRows.length - 1 ? '1px solid #BEB5A9' : 'none',
                }}
              >
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '14px', color: '#291C0E',
                }}>
                  {row.entity}
                </span>
                <Badge label={row.role} variant="neutral" />
              </motion.div>
            ))}
          </div>

          {/* Override toggle */}
<div style={{ padding: '0 24px 16px' }}>
  <button
    onClick={() => setShowOverride(v => !v)}
    style={{
      fontFamily: 'DM Mono, monospace', fontSize: '11px',
      letterSpacing: '0.08em', textTransform: 'uppercase',
      background: 'transparent', border: 'none',
      color: '#A78D78', cursor: 'pointer', padding: 0,
      display: 'flex', alignItems: 'center', gap: '6px',
    }}
  >
    {showOverride ? '▾' : '▸'} Override detection
  </button>

  {showOverride && (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: '12px', display: 'flex',
        gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end',
      }}
    >
      {/* Target column override */}
      <div>
        <p style={{
          fontFamily: 'DM Mono, monospace', fontSize: '10px',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: '#A78D78', margin: '0 0 5px',
        }}>
          Target column
        </p>
        <input
          value={overrideTarget}
          onChange={e => setOverrideTarget(e.target.value)}
          style={{
            fontFamily: 'DM Mono, monospace', fontSize: '12px',
            padding: '7px 10px', borderRadius: '8px',
            border: '1px solid #BEB5A9', background: '#fff8f2',
            color: '#291C0E', outline: 'none', width: '160px',
          }}
          onFocus={e  => e.target.style.borderColor = '#6E473B'}
          onBlur={e   => e.target.style.borderColor = '#BEB5A9'}
        />
      </div>

      {/* Task type override */}
      <div>
        <p style={{
          fontFamily: 'DM Mono, monospace', fontSize: '10px',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: '#A78D78', margin: '0 0 5px',
        }}>
          Task type
        </p>
        <select
          value={taskOverride}
          onChange={e => {
            setTaskOverride(e.target.value)
            listModels(e.target.value).then(d => {
              const m = d.models ?? {}
              setModels(m)
              setSelectedModel(Object.keys(m)[0] ?? '')
            })
          }}
          style={{
            fontFamily: 'DM Mono, monospace', fontSize: '12px',
            padding: '7px 10px', borderRadius: '8px',
            border: '1px solid #BEB5A9', background: '#fff8f2',
            color: '#291C0E', outline: 'none', cursor: 'pointer',
          }}
        >
          {['classification', 'regression', 'clustering'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <p style={{
        fontFamily: 'DM Mono, monospace', fontSize: '11px',
        color: '#A78D78', margin: '0 0 8px', alignSelf: 'flex-end',
      }}>
        Changes apply when you run the pipeline
      </p>
    </motion.div>
  )}
</div>

          {/* Visual strip */}
          <div style={{
            margin: '20px 24px', height: '160px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #A78D78 0%, #6E473B 50%, #291C0E 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: '11px',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.1)',
              padding: '8px 16px', borderRadius: '6px',
              backdropFilter: 'blur(4px)',
            }}>
              Visual Context Locked
            </span>
          </div>

          {/* Footer */}
          <div style={{
            padding: '20px 24px', display: 'flex',
            alignItems: 'center', justifyContent: 'flex-end',
            borderTop: '1px solid #BEB5A9', gap: '12px', flexWrap: 'wrap',
          }}>

            {/* Auto / Manual toggle */}
            <div style={{ display: 'flex', gap: '8px', marginRight: 'auto' }}>
              {(['auto', 'manual'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '11px',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                    border: '1px solid #BEB5A9',
                    background: mode === m ? '#291C0E' : 'transparent',
                    color:      mode === m ? '#E1D4C2' : '#A78D78',
                    transition: 'all 0.15s',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Model dropdown — manual mode only */}
            {mode === 'manual' && (
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '12px',
                  padding: '8px 12px', borderRadius: '8px',
                  border: '1px solid #BEB5A9', background: '#fff8f2',
                  color: '#291C0E', cursor: 'pointer', outline: 'none',
                }}
              >
                {Object.entries(models).map(([id, m]: [string, any]) => (
                  <option key={id} value={id}>{m.name}</option>
                ))}
              </select>
            )}

            {/* Error */}
            {error && (
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '12px',
                color: '#ba1a1a', margin: 0,
              }}>
                {error}
              </p>
            )}

            <button
              className="btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
              style={{ opacity: loading ? 0.5 : 1 }}
            >
              Back
            </button>

            <button
              className="btn-primary"
              onClick={handleRun}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 14, height: 14,
                      border: '2px solid rgba(225,212,194,0.3)',
                      borderTopColor: '#E1D4C2', borderRadius: '50%',
                    }}
                  />
                  Starting...
                </>
              ) : (
                <><Play size={14} strokeWidth={1.5} /> Run Pipeline</>
              )}
            </button>

          </div>
        </motion.div>

      </main>
    </div>
  )
}