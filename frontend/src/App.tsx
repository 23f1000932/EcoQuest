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
    <div className="min-h-screen bg-background text-on-background">
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
            background: '#ffffff',
            color: '#0b1c30',
            border: '1px solid #bccbb9',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          success: { iconTheme: { primary: '#006e2f', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#ba1a1a', secondary: '#ffffff' } },
        }}
      />
    </div>
  )
}
