import { Routes, Route, Navigate } from 'react-router-dom'
import UploadPage   from './pages/Upload'
import DetectPage   from './pages/Detect'
import TrainingPage from './pages/Training'
import ResultsPage  from './pages/Results'
import ModelsPage   from './pages/Models'

export default function App() {
  return (
    <Routes>
      <Route path="/"                element={<UploadPage />}   />
      <Route path="/detect/:fileId"  element={<DetectPage />}   />
      <Route path="/pipeline/:runId" element={<TrainingPage />} />
      <Route path="/results/:runId"  element={<ResultsPage />}  />
      <Route path="/models"          element={<ModelsPage />}   />
      <Route path="*"                element={<Navigate to="/" />} />
    </Routes>
  )
}