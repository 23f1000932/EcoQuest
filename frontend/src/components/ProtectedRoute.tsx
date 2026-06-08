import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Leaf } from 'lucide-react'

interface Props {
  children: React.ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050d05]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center animate-pulse">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-green-400/30 animate-ping" />
          </div>
          <p className="text-green-400/60 text-sm">Loading EcoQuest...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export function AdminRoute({ children }: Props) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  if (!user.is_admin) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
