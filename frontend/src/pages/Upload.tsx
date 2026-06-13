import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../api/client'
import UploadZone from '../components/UploadZone'
import AIVerificationModal from '../components/AIVerificationModal'
import type { UploadResponse } from '../types'
import { Loader2, Brain, Leaf, Info, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const ACTIVITY_INFO = [
  { type: 'Tree Plantation',   icon: '🌳', pts: 100 },
  { type: 'Community Cleanup', icon: '🧹', pts: 80  },
  { type: 'Cycling',           icon: '🚴', pts: 25  },
  { type: 'Public Transport',  icon: '🚌', pts: 30  },
  { type: 'Waste Segregation', icon: '♻️', pts: 20  },
  { type: 'Reusable Bottle',   icon: '🍶', pts: 10  },
  { type: 'Cloth Bag',         icon: '👜', pts: 10  },
  { type: 'Other Eco',         icon: '🌱', pts: 15  },
]

export default function Upload() {
  const { refreshUser } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('Uploading image...')

  const loadingMessages = [
    'Uploading image...',
    'AI is analyzing your action...',
    'Verifying authenticity...',
    'Calculating impact...',
    'Almost done...',
  ]

  const handleSubmit = async () => {
    if (!selectedFile) { toast.error('Please select an image first'); return }
    setLoading(true)
    let msgIndex = 0
    const msgTimer = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length
      setLoadingMessage(loadingMessages[msgIndex])
    }, 2000)
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      if (description) formData.append('description', description)
      const response = await apiClient.post<UploadResponse>('/activities/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(response.data)
      await refreshUser()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      clearInterval(msgTimer)
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    setResult(null)
    setSelectedFile(null)
    setDescription('')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header bar */}
      <div className="h-16" /> {/* spacer for fixed navbar */}

      <main className="pt-8 pb-16 px-4 md:px-8 max-w-3xl mx-auto">
        {/* Back link */}
        <Link to="/dashboard" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm mb-6 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Page header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-on-background font-geist mb-2">Submit Activity</h1>
            <p className="text-on-surface-variant">Upload photo evidence of your green action for AI verification.</p>
          </div>

          {/* Upload form card */}
          <div className="glass-card p-6 mb-5">
            <UploadZone onFileSelected={setSelectedFile} disabled={loading} />

            <div className="mt-6">
              <label className="block text-on-surface text-sm font-semibold mb-2" htmlFor="activity-description">
                Description <span className="text-on-surface-variant font-normal">(optional)</span>
              </label>
              <textarea
                id="activity-description"
                className="input-field resize-none"
                rows={3}
                placeholder="Describe your eco action... (e.g., 'Planted a mango sapling in my backyard')"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex justify-end pt-5 border-t border-outline-variant/40 mt-5">
              <button
                id="verify-submit-btn"
                onClick={handleSubmit}
                disabled={!selectedFile || loading}
                className="btn-primary flex items-center justify-center gap-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={loadingMessage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {loadingMessage}
                      </motion.span>
                    </AnimatePresence>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" /> Verify & Submit
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tips card */}
          <div className="glass-card p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <p className="text-on-surface text-sm font-semibold">Tips for successful verification</p>
            </div>
            <ul className="space-y-1.5 text-on-surface-variant text-sm">
              <li>✅ Take a clear, well-lit photo</li>
              <li>✅ Ensure the eco activity is clearly visible</li>
              <li>✅ Include yourself in the photo for better confidence</li>
              <li>❌ Screenshots and digital images are rejected</li>
              <li>❌ Duplicate or previously submitted images are blocked</li>
            </ul>
          </div>

          {/* Points guide */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-4 h-4 text-primary" />
              <p className="text-on-surface text-sm font-semibold">Points by activity</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ACTIVITY_INFO.map(({ type, icon, pts }) => (
                <div key={type} className="flex items-center gap-2 bg-surface-container rounded-xl p-2.5">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <p className="text-on-surface text-xs font-medium leading-tight">{type}</p>
                    <p className="text-primary text-xs font-bold">+{pts} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      <AIVerificationModal result={result} onClose={handleModalClose} />
    </div>
  )
}
