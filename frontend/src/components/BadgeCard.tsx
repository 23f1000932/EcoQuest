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
      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 text-center ${
        earned
          ? 'border-outline-variant bg-surface-container-lowest hover:border-primary/40 cursor-default shadow-sm'
          : 'border-dashed border-outline-variant bg-surface-bright opacity-60'
      }`}
      title={badge.description}
    >
      {!earned && (
        <div className="absolute top-2 right-2">
          <Lock className="w-3 h-3 text-outline" />
        </div>
      )}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
          earned
            ? 'bg-gradient-to-br from-primary/15 to-secondary/15'
            : 'bg-surface-container'
        }`}
      >
        {badge.icon}
      </div>
      <div>
        <p className={`text-xs font-semibold ${earned ? 'text-on-background' : 'text-outline'}`}>
          {badge.name}
        </p>
        {earned && badge.earned_at && (
          <p className="text-primary text-xs mt-0.5">
            {new Date(badge.earned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        )}
        {!earned && (
          <p className="text-on-surface-variant text-xs mt-0.5">{badge.points_req} pts</p>
        )}
      </div>
    </motion.div>
  )
}
