import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './components/AuthProvider'
import { ProtectedRoute, RequireAdmin, RequirePageAccess } from './components/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { AuthorizationsPage } from './pages/AuthorizationsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={
                <RequirePageAccess pageId="dashboard">
                  <DashboardPage />
                </RequirePageAccess>
              } />
              <Route path="projetos" element={
                <RequirePageAccess pageId="projetos">
                  <ProjectsPage />
                </RequirePageAccess>
              } />
              <Route path="projetos/:id" element={
                <RequirePageAccess pageId="projetos">
                  <ProjectDetailPage />
                </RequirePageAccess>
              } />
              <Route path="autorizacoes" element={
                <RequireAdmin>
                  <AuthorizationsPage />
                </RequireAdmin>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
