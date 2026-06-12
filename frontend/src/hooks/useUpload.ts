import { useState } from 'react'
import { uploadFile, detectFile } from '../api'
import type { UploadResponse, DetectResponse } from '../types'

export function useUpload() {
  const [uploading, setUploading]   = useState(false)
  const [detecting, setDetecting]   = useState(false)
  const [uploaded, setUploaded]     = useState<UploadResponse | null>(null)
  const [detected, setDetected]     = useState<DetectResponse | null>(null)
  const [error, setError]           = useState<string | null>(null)

  const upload = async (file: File) => {
    try {
      setUploading(true)
      setError(null)
      const result = await uploadFile(file)
      setUploaded(result)

      // auto-run detect right after upload
      setDetecting(true)
      const detection = await detectFile(result.file_id)
      setDetected(detection)

      return { uploaded: result, detected: detection }
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message)
      return null
    } finally {
      setUploading(false)
      setDetecting(false)
    }
  }

  const reset = () => {
    setUploaded(null)
    setDetected(null)
    setError(null)
  }

  return { upload, uploading, detecting, uploaded, detected, error, reset }
}