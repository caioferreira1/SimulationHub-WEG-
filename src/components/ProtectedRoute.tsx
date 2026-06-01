import { Navigate } from 'react-router-dom'
import { Clock, ShieldOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-weg-surface">
      <div className="w-8 h-8 border-4 border-weg-green border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth()

  if (loading || (user && !profile)) return <Spinner />
  if (!user) return <Navigate to="/login" replace />

  if (profile.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-weg-surface p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Aguardando aprovação</h1>
          <p className="text-gray-500 text-sm mb-1">
            Sua conta está sendo revisada pelo administrador do SimulationHub.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Você receberá acesso assim que sua solicitação for aprovada.
          </p>
          <p className="text-xs text-gray-400 mb-6">{user.email}</p>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Sair
          </button>
        </div>
      </div>
    )
  }

  if (profile.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-weg-surface p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Acesso negado</h1>
          <p className="text-gray-500 text-sm mb-6">
            Sua solicitação de acesso ao SimulationHub foi recusada. Entre em contato com o administrador para mais informações.
          </p>
          <p className="text-xs text-gray-400 mb-6">{user.email}</p>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Sair
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()
  if (profile?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export function RequirePageAccess({ pageId, children }: { pageId: string; children: React.ReactNode }) {
  const { profile } = useAuth()
  if (profile?.role === 'admin') return <>{children}</>
  if (!profile?.page_access.includes(pageId)) return <Navigate to="/" replace />
  return <>{children}</>
}
