import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, Loader } from 'lucide-react'
import Nav from '../components/Nav'
import { cancelRun, retryRun } from '../api'
import { usePipeline } from '../hooks/usePipeline'

const STAGES = [
  { key: 'loading',    label: 'INITIALIZE_ENV'     },
  { key: 'eda',        label: 'LOAD_DATASETS'       },
  { key: 'training',   label: 'WEIGHT_OPTIMIZATION' },
  { key: 'evaluation', label: 'VALIDATION_PASS'     },
  { key: 'completed',  label: 'EXPORT_ARTIFACTS'    },
]

const LOG_LINES = [
  '[SYS] System architecture verified: x64_86',
  '[SYS] Environment established via local registry',
  '[INF] Loading dataset into memory...',
  '[INF] Checksum verified',
  '[RUN] Starting model training — pass 1/1',
  '[RUN] Fitting estimator on training split...',
  '[RUN] Cross-validation in progress...',
  '[RUN] Evaluating on held-out test set...',
  '[RUN] Computing feature importances via SHAP...',
  '[OK]  Training complete — exporting artifacts',
]

function getStageStatus(stageKey: string, currentStage: string) {
  const order       = STAGES.map(s => s.key)
  const currentIdx  = order.indexOf(currentStage)
  const stageIdx    = order.indexOf(stageKey)
  if (currentStage === 'completed') return 'done'
  if (stageIdx < currentIdx)        return 'done'
  if (stageIdx === currentIdx)      return 'running'
  return 'queued'
}

export default function TrainingPage() {
  const { runId }  = useParams<{ runId: string }>()
  const navigate   = useNavigate()
  const { run }    = usePipeline(runId ?? null)
  const logRef     = useRef<HTMLDivElement>(null)

  // Navigate to results when complete
  useEffect(() => {
    if (run?.status === 'completed') {
      const t = setTimeout(() => navigate(`/results/${runId}`), 1200)
      return () => clearTimeout(t)
    }
  }, [run?.status, runId, navigate])

  // Auto-scroll log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [run?.progress_pct])

  const handleCancel = async () => {
  if (!runId) return
  try {
    await cancelRun(runId)
  } catch (e) {
    console.error('Cancel failed', e)
  }
}

const handleRetry = async () => {
  if (!runId) return
  try {
    await retryRun(runId)
    // re-polling picks up automatically since usePipeline is still watching
  } catch (e) {
    console.error('Retry failed', e)
  }
}

  const progress    = run?.progress_pct ?? 0
  const stage       = run?.current_stage ?? 'queued'
  const visibleLogs = Math.max(1, Math.ceil((progress / 100) * LOG_LINES.length))

  if (!runId) {
    navigate('/')
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff8f2' }}>
      <Nav active="Training" />

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Run ID + progress % */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '11px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: '#A78D78', marginBottom: '12px',
          }}>
            Pipeline Run: {runId.slice(0, 8).toUpperCase()}
          </p>

          <motion.h1
            key={progress}
            initial={{ opacity: 0.6, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '72px', fontWeight: 700,
              color: '#291C0E', margin: '0 0 20px',
              letterSpacing: '-0.03em', lineHeight: 1,
            }}
          >
            {progress}%
          </motion.h1>

          {/* Progress bar */}
          <div style={{ height: '2px', background: '#E1D4C2', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ height: '100%', background: '#6E473B', borderRadius: '2px' }}
            />
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Stage stepper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {STAGES.map((s, i) => {
              const status = getStageStatus(s.key, stage)
              return (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    border: `1px solid ${status === 'running' ? '#6E473B' : '#BEB5A9'}`,
                    borderRadius: '12px',
                    background: status === 'running' ? 'rgba(110,71,59,0.04)' : 'transparent',
                    transition: 'all 0.3s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {status === 'done' && <CheckCircle size={16} color="#6E473B" strokeWidth={1.5} />}
                    {status === 'running' && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader size={16} color="#6E473B" strokeWidth={1.5} />
                      </motion.div>
                    )}
                    {status === 'queued' && <Circle size={16} color="#BEB5A9" strokeWidth={1.5} />}
                    <span style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 500,
                      letterSpacing: '0.08em',
                      color: status === 'queued' ? '#A78D78' : '#291C0E',
                    }}>
                      {s.label}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '11px',
                    color: status === 'running' ? '#6E473B'
                         : status === 'done'    ? '#A78D78'
                         : '#BEB5A9',
                    letterSpacing: '0.08em',
                  }}>
                    {status === 'running' ? 'RUNNING' : status === 'done' ? '✓' : 'QUEUED'}
                  </span>
                </motion.div>
              )
            })}
          </div>

          {/* Live log terminal */}
          <div style={{
            background: '#291C0E', borderRadius: '12px',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}>
            {/* Terminal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['#A78D78', '#BEB5A9', '#E1D4C2'].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <span style={{
                fontFamily: 'DM Mono, monospace', fontSize: '10px',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                Live Output Stream
              </span>
            </div>

            {/* Log lines */}
            <div ref={logRef} style={{
              padding: '16px', flex: 1,
              overflowY: 'auto', minHeight: '280px', maxHeight: '280px',
            }}>
              <AnimatePresence>
                {LOG_LINES.slice(0, visibleLogs).map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '11px',
                      lineHeight: 1.7, margin: 0,
                      color: line.startsWith('[OK]')  ? '#A78D78'
                           : line.startsWith('[RUN]') ? '#E1D4C2'
                           : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {line}
                  </motion.p>
                ))}
              </AnimatePresence>

              {run?.status === 'failed' && (
                <p style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '11px',
                  color: '#ba1a1a', margin: '8px 0 0',
                }}>
                  [ERR] {run.error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: '24px', marginTop: '24px',
          }}
        >
          {[
            { label: 'Elapsed Time',   value: run?.status === 'completed' ? 'Done'    : '—'      },
            { label: 'Resources',      value: 'Local CPU'                                        },
            { label: 'Est. Remaining', value: run?.status === 'completed' ? '0 mins'  : '~1 min' },
          ].map(stat => (
            <div key={stat.label} style={{
              border: '1px solid #BEB5A9', borderRadius: '12px', padding: '20px 24px',
            }}>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '11px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#A78D78', margin: '0 0 8px',
              }}>
                {stat.label}
              </p>
              <p style={{
                fontFamily: 'Playfair Display, serif', fontSize: '28px',
                fontWeight: 600, color: '#291C0E', margin: 0,
              }}>
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>
          {run?.status === 'running' && (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}
  >
    <button
      className="btn-secondary"
      onClick={handleCancel}
      style={{ color: '#ba1a1a', borderColor: '#ba1a1a' }}
    >
      Cancel run
    </button>
  </motion.div>
)}

        {/* Failed state */}
{run?.status === 'failed' && (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    style={{
      marginTop: '24px', padding: '20px 24px',
      border: '1px solid #ba1a1a', borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}
  >
    <p style={{
      fontFamily: 'DM Mono, monospace', fontSize: '13px',
      color: '#ba1a1a', margin: 0, flex: 1,
    }}>
      Pipeline failed: {run.error}
    </p>
    <div style={{ display: 'flex', gap: '10px', marginLeft: '16px' }}>
      <button className="btn-secondary" onClick={handleRetry}>
        Retry
      </button>
      <button className="btn-secondary" onClick={() => navigate('/')}>
        Start over
      </button>
    </div>
  </motion.div>
)}
      </main>
    </div>
  )
}