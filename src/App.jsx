import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar          from './components/Navbar'
import RateLimitBanner from './components/RateLimitBanner'
import HomePage        from './pages/HomePage'
import OverviewPage    from './pages/OverviewPage'
import RepositoriesPage from './pages/RepositoriesPage'
import ContributorsPage from './pages/ContributorsPage'
import NetworkPage     from './pages/NetworkPage'
import AnalyticsPage   from './pages/AnalyticsPage'
import GovernancePage  from './pages/GovernancePage'
import SettingsPage    from './pages/SettingsPage'

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <RateLimitBanner />
      <main style={{ flex: 1 }}>{children}</main>
      <footer style={{
        padding: '18px 24px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 11,
        color: 'var(--text3)',
        letterSpacing: '.04em',
        marginTop: 40,
      }}>
        <span>V2.0.0 · GITHUB · DOCUMENTATION · TERMS</span>
        <span>2026 ORGEXPLORER · BUILT BY RITIK</span>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/overview"     element={<OverviewPage />} />
          <Route path="/repositories" element={<RepositoriesPage />} />
          <Route path="/contributors" element={<ContributorsPage />} />
          <Route path="/network"      element={<NetworkPage />} />
          <Route path="/analytics"    element={<AnalyticsPage />} />
          <Route path="/governance"   element={<GovernancePage />} />
          <Route path="/settings"     element={<SettingsPage />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AppProvider>
  )
}
