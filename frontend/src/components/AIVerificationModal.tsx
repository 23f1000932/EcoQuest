import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Clock, AlertTriangle, Zap, Leaf, Brain } from 'lucide-react'
import type { UploadResponse } from '../types'
import { ACTIVITY_ICONS } from '../types'
import confetti from 'canvas-confetti'

interface Props {
  result: UploadResponse | null
  onClose: () => void
}

export default function AIVerificationModal({ result, onClose }: Props) {
  const firedConfetti = useRef(false)

  useEffect(() => {
    if (result?.activity.status === 'approved' && !firedConfetti.current) {
      firedConfetti.current = true
      const end = Date.now() + 3000
      const colors = ['#006e2f', '#22c55e', '#4ae176', '#6bff8f']
      const frame = () => {
        confetti({ particleCount: 3, angle: 60,  spread: 55, origin: { x: 0 }, colors })
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }
  }, [result])

  const activity    = result?.activity
  const aiResponse  = activity?.ai_response

  const statusConfig = {
    approved: {
      icon: CheckCircle,
      color: 'text-primary',
      bg: 'bg-gradient-to-b from-primary/5 to-transparent',
      border: 'border-primary/20',
      title: '🎉 Action Verified!',
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-gradient-to-b from-yellow-500/5 to-transparent',
      border: 'border-yellow-400/30',
      title: '⏳ Under Review',
    },
    rejected: {
      icon: AlertTriangle,
      color: 'text-error',
      bg: 'bg-gradient-to-b from-error/5 to-transparent',
      border: 'border-error/20',
      title: '❌ Not Verified',
    },
  }

  const config = activity ? statusConfig[activity.status] : null
  const icon   = activity ? (ACTIVITY_ICONS[activity.activity_type] || '🌱') : '🌱'

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-on-background/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`w-full max-w-md rounded-3xl border ${config?.border} ${config?.bg} bg-surface-container-lowest overflow-hidden shadow-card-hover`}
          >
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{icon}</div>
                  <div>
                    <h2 className={`text-xl font-bold font-geist ${config?.color}`}>{config?.title}</h2>
                    <p className="text-on-surface-variant text-sm">{activity?.activity_type}</p>
                  </div>
                </div>
                <button
                  id="close-modal-btn"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Confidence bar */}
            {aiResponse && (
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
                    <Brain className="w-3.5 h-3.5" /> AI Confidence
                  </div>
                  <span className={`text-sm font-bold ${config?.color}`}>{aiResponse.confidence}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${aiResponse.confidence}%` }}
                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                  />
                </div>
                {aiResponse.reason && (
                  <p className="text-on-surface-variant text-xs mt-2 italic">"{aiResponse.reason}"</p>
                )}
              </div>
            )}

            {/* Stats (approved only) */}
            {activity?.status === 'approved' && (
              <div className="px-6 pb-4 grid grid-cols-2 gap-3">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-medium">Points</span>
                  </div>
                  <p className="text-on-background text-2xl font-bold">+{activity.points_awarded}</p>
                </div>
                <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-secondary mb-1">
                    <Leaf className="w-4 h-4" />
                    <span className="text-xs font-medium">CO₂ Saved</span>
                  </div>
                  <p className="text-on-background text-2xl font-bold">
                    {activity.carbon_saved.toFixed(1)}<span className="text-sm font-normal text-on-surface-variant">kg</span>
                  </p>
                </div>
              </div>
            )}

            {/* Newly earned badges */}
            {result.badges_earned?.length > 0 && (
              <div className="px-6 pb-4">
                <p className="text-on-surface-variant text-xs font-medium mb-3">🏆 New Badges Unlocked!</p>
                <div className="flex gap-3 flex-wrap">
                  {result.badges_earned.map(badge => (
                    <motion.div
                      key={badge.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="flex items-center gap-2 bg-surface-container border border-outline-variant rounded-xl px-3 py-2"
                    >
                      <span className="text-xl">{badge.icon}</span>
                      <div>
                        <p className="text-on-surface text-xs font-semibold">{badge.name}</p>
                        <p className="text-primary text-xs">{badge.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Message + Done */}
            <div className="px-6 pb-6">
              <p className={`text-sm font-medium ${config?.color} mb-4`}>{result.message}</p>
              <button
                id="modal-done-btn"
                onClick={onClose}
                className="btn-primary w-full"
              >
                {activity?.status === 'approved' ? 'Awesome! 🎉' : 'Got it'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
