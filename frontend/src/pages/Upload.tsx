import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from '../components/Nav'
import { useUpload } from '../hooks/useUpload'
import { useAppStore } from '../store/appStore'
import { Clock, ChevronRight } from 'lucide-react'

export default function UploadPage() {
  const navigate                        = useNavigate()
  const { upload, uploading, detecting, error } = useUpload()
  const [dragging, setDragging]         = useState(false)
  const [fileName, setFileName]         = useState<string | null>(null)
  const { history, setUpload, resumeRun } = useAppStore()


const handleFile = useCallback(async (file: File) => {
  setFileName(file.name)
  const result = await upload(file)
  if (result) {
    setUpload(result.uploaded.file_id, file.name, result.detected)
    navigate(`/detect/${result.uploaded.file_id}`)
  }
}, [upload, navigate, setUpload])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const isLoading = uploading || detecting

  return (
    <div style={{ minHeight: '100vh', background: '#fff8f2' }}>
      <Nav active="Datasets" />

      <main style={{
        maxWidth: '860px', margin: '0 auto',
        padding: '80px 24px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '48px',
      }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '48px', fontWeight: 700,
            color: '#291C0E', lineHeight: 1.1,
            letterSpacing: '-0.03em', margin: '0 0 16px',
          }}>
            Drop your data.<br />We'll figure out the rest.
          </h1>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '14px', color: '#A78D78',
          }}>
            Upload any CSV, Excel, or image dataset
          </p>
        </motion.div>

        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ width: '100%' }}
        >
          <label
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '16px', padding: '80px 40px',
              border: `1.5px dashed ${dragging ? '#6E473B' : '#BEB5A9'}`,
              borderRadius: '12px',
              background: dragging ? 'rgba(110,71,59,0.04)' : 'transparent',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.json,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={onInputChange}
              disabled={isLoading}
            />

            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#E1D4C2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isLoading ? <Spinner /> : <UploadIcon size={24} color="#6E473B" strokeWidth={1.5} />}
            </div>

            {/* Status */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '12px',
                fontWeight: 500, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#291C0E', margin: '0 0 6px',
              }}>
                {uploading ? 'Uploading...'
                  : detecting ? 'Detecting data context...'
                  : fileName  ? fileName
                  : 'Select files or drag here'}
              </p>
              {!isLoading && (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#A78D78', margin: 0 }}>
                  Maximum file size: 512MB
                </p>
              )}
            </div>

            {/* Format badges */}
            {!isLoading && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['.csv', '.xlsx', '.jpg', '.json'].map(ext => (
                  <span key={ext} style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '11px',
                    color: '#6E473B', border: '1px solid #BEB5A9',
                    borderRadius: '4px', padding: '3px 10px',
                  }}>
                    {ext}
                  </span>
                ))}
              </div>
            )}
          </label>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '12px',
                  color: '#ba1a1a', marginTop: '12px', textAlign: 'center',
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {history.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 }}
    style={{ width: '100%' }}
  >
    <p style={{
      fontFamily: 'DM Mono, monospace', fontSize: '11px',
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: '#A78D78', margin: '0 0 12px',
      display: 'flex', alignItems: 'center', gap: '6px',
    }}>
      <Clock size={12} strokeWidth={1.5} />
      Recent Runs
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {history.slice(0, 4).map((entry, i) => (
        <motion.div
          key={entry.runId}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => { resumeRun(entry); navigate(`/results/${entry.runId}`) }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', border: '1px solid #BEB5A9',
            borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#6E473B' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#BEB5A9' }}
        >
          <div>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#291C0E', margin: '0 0 2px' }}>
              {entry.filename}
            </p>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#A78D78', margin: 0 }}>
              {entry.taskType} · {entry.targetCol} · {entry.timestamp}
            </p>
          </div>
          <ChevronRight size={14} color="#A78D78" strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  </motion.div>
)}              

        {/* Info cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%' }}
        >
          {[
            {
              title: 'Automatic Schema',
              desc: 'Our engine automatically identifies columns, types, and potential anomalies in your structured data.',
            },
            {
              title: 'Image Recognition',
              desc: 'Bulk upload images for classification. We handle the preprocessing and labeling extraction.',
            },
          ].map(card => (
            <div key={card.title} style={{
              border: '1px solid #BEB5A9', borderRadius: '12px',
              padding: '24px', background: 'transparent',
            }}>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 500,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#A78D78', margin: '0 0 12px',
              }}>
                {card.title}
              </p>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '14px',
                color: '#291C0E', lineHeight: 1.6, margin: 0,
              }}>
                {card.desc}
              </p>
            </div>
          ))}
        </motion.div>

      </main>
    </div>
  )
}

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{
        width: 20, height: 20,
        border: '2px solid #BEB5A9',
        borderTopColor: '#6E473B',
        borderRadius: '50%',
      }}
    />
  )
}