import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Rewards from './pages/Rewards'
import Impact from './pages/Impact'
import Admin from './pages/Admin'

export default function App() {
  const { loading } = useAuth()

  if (loading) return null

  return (
    <div className="min-h-screen bg-[#050d05]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
        <Route path="/impact" element={<ProtectedRoute><Impact /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f1a0f',
            color: '#f0fdf4',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#050d05' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#050d05' } },
        }}
      />
    </div>
  )
}
