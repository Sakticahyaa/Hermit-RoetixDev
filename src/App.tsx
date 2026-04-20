import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RoetixDev } from './pages/RoetixDev'
import { BoardPage } from './pages/BoardPage'
import { ListPage } from './pages/ListPage'
import { ProjectPage } from './pages/ProjectPage'
import { SeerPage } from './pages/SeerPage'
import { TimekeeperPage } from './pages/TimekeeperPage'
import { ArchivedPage } from './pages/ArchivedPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/RoetixDev" element={<RoetixDev />}>
          <Route index element={<Navigate to="board" replace />} />
          <Route path="board" element={<BoardPage />} />
          <Route path="list" element={<ListPage />} />
          <Route path="project" element={<ProjectPage />} />
          <Route path="seer" element={<SeerPage />} />
          <Route path="timekeeper" element={<TimekeeperPage />} />
          <Route path="archived" element={<ArchivedPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/RoetixDev/board" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
