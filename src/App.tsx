import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RoetixDev } from './pages/RoetixDev'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/RoetixDev" element={<RoetixDev />} />
        <Route path="*" element={<Navigate to="/RoetixDev" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
