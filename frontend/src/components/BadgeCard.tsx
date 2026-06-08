import { motion } from 'framer-motion'
import type { Badge } from '../types'
import { Lock } from 'lucide-react'

interface Props {
  badge: Badge
  earned?: boolean
  index?: number
}

export default function BadgeCard({ badge, earned = true, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${
        earned
          ? 'border-green-500/30 bg-green-500/10 hover:border-green-400/50 hover:bg-green-500/15 cursor-default'
          : 'border-white/10 bg-white/3 opacity-50'
      }`}
      title={badge.description}
    >
      {!earned && (
        <div className="absolute top-2 right-2">
          <Lock className="w-3 h-3 text-white/30" />
        </div>
      )}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          earned ? 'shadow-lg' : 'grayscale'
        }`}
        style={earned ? { boxShadow: `0 0 20px ${badge.color}40` } : {}}
      >
        {badge.icon}
      </div>
      <div className="text-center">
        <p className={`text-xs font-semibold ${earned ? 'text-white' : 'text-white/40'}`}>{badge.name}</p>
        {earned && badge.earned_at && (
          <p className="text-green-400/50 text-xs mt-0.5">
            {new Date(badge.earned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        )}
        {!earned && (
          <p className="text-white/30 text-xs mt-0.5">{badge.points_req} pts</p>
        )}
      </div>
    </motion.div>
  )
}
