import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../api/client'
import UploadZone from '../components/UploadZone'
import AIVerificationModal from '../components/AIVerificationModal'
import type { UploadResponse } from '../types'
import { Loader2, Brain, Leaf, Info } from 'lucide-react'
import toast from 'react-hot-toast'

const ACTIVITY_INFO = [
  { type: 'Tree Plantation', icon: '🌳', pts: 100 },
  { type: 'Community Cleanup', icon: '🧹', pts: 80 },
  { type: 'Cycling', icon: '🚴', pts: 25 },
  { type: 'Public Transport', icon: '🚌', pts: 30 },
  { type: 'Waste Segregation', icon: '♻️', pts: 20 },
  { type: 'Reusable Bottle', icon: '🍶', pts: 10 },
  { type: 'Cloth Bag', icon: '👜', pts: 10 },
  { type: 'Other Eco', icon: '🌱', pts: 15 },
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
    if (!selectedFile) {
      toast.error('Please select an image first')
      return
    }

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
      const msg = error.response?.data?.detail || 'Upload failed. Please try again.'
      toast.error(msg)
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
    <div className="page-container max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Upload Eco Action</h1>
          <p className="text-white/40 mt-1">Submit proof of your sustainable action for AI verification</p>
        </div>

        {/* Upload Form */}
        <div className="glass-card p-6 mb-6">
          <UploadZone onFileSelected={setSelectedFile} disabled={loading} />

          <div className="mt-6">
            <label className="block text-white/60 text-sm font-medium mb-2">
              Description <span className="text-white/20">(optional)</span>
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

          <button
            id="verify-submit-btn"
            onClick={handleSubmit}
            disabled={!selectedFile || loading}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
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

        {/* Tips */}
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-green-400" />
            <p className="text-white/60 text-sm font-medium">Tips for successful verification</p>
          </div>
          <ul className="space-y-1.5 text-white/40 text-xs">
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
            <Leaf className="w-4 h-4 text-green-400" />
            <p className="text-white/60 text-sm font-medium">Points by activity</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ACTIVITY_INFO.map(({ type, icon, pts }) => (
              <div key={type} className="flex items-center gap-2 bg-white/3 rounded-xl p-2.5">
                <span>{icon}</span>
                <div>
                  <p className="text-white text-xs font-medium leading-tight">{type}</p>
                  <p className="text-green-400 text-xs font-bold">+{pts} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI Verification Modal */}
      <AIVerificationModal result={result} onClose={handleModalClose} />
    </div>
  )
}
