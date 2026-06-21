import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

const Landing = lazy(() => import('./pages/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Upload = lazy(() => import('./pages/Upload'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Rewards = lazy(() => import('./pages/Rewards'))
const Impact = lazy(() => import('./pages/Impact'))
const Admin = lazy(() => import('./pages/Admin'))

export default function App() {
  const { loading } = useAuth()

  if (loading) return null

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />
      <AuthModal />
      <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
          <Route path="/impact" element={<ProtectedRoute><Impact /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          {/* /activities redirects to /profile which shows the activity history */}
          <Route path="/activities" element={<Navigate to="/profile" replace />} />
          {/* Catch-all: redirect unknown routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
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
