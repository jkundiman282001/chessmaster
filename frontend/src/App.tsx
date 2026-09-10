import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LandingPage } from './pages/LandingPage'
import { HealthPage } from './pages/HealthPage'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page (Phase 2) */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated Player Hub (Phase 3) */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Architecture Diagnostics & Health Probe (Phase 0 & 1 Hub) */}
          <Route path="/health" element={<HealthPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
