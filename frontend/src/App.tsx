import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import FigmaProjectDetailPage from './pages/FigmaProjectDetailPage'
import CodeGenerationPage from './pages/CodeGenerationPage'
import AboutPage from './pages/AboutPage'
import BlogPage from './pages/BlogPage'
import ContactPage from './pages/ContactPage'
import CareersPage from './pages/CareersPage'
import DocumentationPage from './pages/DocumentationPage'
import ApiReferencePage from './pages/ApiReferencePage'
import ChangelogPage from './pages/ChangelogPage'
import StatusPage from './pages/StatusPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/docs" element={<DocumentationPage />} />
            <Route path="/api" element={<ApiReferencePage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/auth" element={<AuthPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/figma/:projectId"
              element={
                <ProtectedRoute>
                  <FigmaProjectDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/figma/:projectId/codegen"
              element={
                <ProtectedRoute>
                  <CodeGenerationPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  )
}
