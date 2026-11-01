import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/layout/Layout'
import AILoadingState from './components/ui/AILoadingState'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { useTabExperience } from './hooks/useTabTitle'

// Route-based code splitting for optimal production performance
const LandingPage = lazy(() => import('./pages/LandingPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))
const OAuthCallbackPage = lazy(() => import('./pages/OAuthCallbackPage'))
const FigmaProjectDetailPage = lazy(() => import('./pages/FigmaProjectDetailPage'))
const CodeGenerationPage = lazy(() => import('./pages/CodeGenerationPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const CareersPage = lazy(() => import('./pages/CareersPage'))
const DocumentationPage = lazy(() => import('./pages/DocumentationPage'))
const ApiReferencePage = lazy(() => import('./pages/ApiReferencePage'))
const ChangelogPage = lazy(() => import('./pages/ChangelogPage'))
const StatusPage = lazy(() => import('./pages/StatusPage'))

function PageFallback() {
  return (
    <div className="min-h-screen bg-[#070912] flex items-center justify-center p-6">
      <AILoadingState className="max-w-md w-full" lines={4} />
    </div>
  )
}

export default function App() {
  useTabExperience()

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageFallback />}>
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

              {/* Authentication Routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/login" element={<AuthPage defaultMode="login" />} />
              <Route path="/signup" element={<AuthPage defaultMode="signup" />} />

              {/* OAuth Callbacks */}
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/auth/google/callback" element={<AuthCallbackPage />} />
              <Route path="/auth/discord/callback" element={<OAuthCallbackPage provider="discord" />} />

              {/* Protected Routes */}
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
        </Suspense>
      </AnimatePresence>
    </AuthProvider>
  )
}
