import { motion } from 'framer-motion'
import type { Activity } from '../types'
import { ACTIVITY_ICONS } from '../types'
import { Calendar, CheckCircle, Clock, XCircle, Zap, Leaf } from 'lucide-react'

interface Props {
  activity: Activity
  index?: number
}

const statusConfig = {
  approved: {
    icon: CheckCircle,
    label: 'Approved',
    className: 'bg-secondary-container/30 text-on-secondary-container border border-secondary-container/50',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    className: 'bg-surface-container-high text-on-surface-variant border border-outline-variant',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    className: 'bg-error-container/50 text-on-error-container border border-error/30',
  },
}

export default function ActivityCard({ activity, index = 0 }: Props) {
  const status = statusConfig[activity.status]
  const StatusIcon = status.icon
  const icon = ACTIVITY_ICONS[activity.activity_type] || '🌱'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="flex items-center justify-between p-4 border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low transition-colors"
    >
      {/* Left: icon + info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-xl flex-shrink-0">
          {activity.image_url && !activity.image_url.includes('placeholder') ? (
            <img
              src={activity.image_url}
              alt={activity.activity_type}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span>{icon}</span>
          )}
        </div>
        <div>
          <p className="text-on-background font-semibold text-sm">{activity.activity_type}</p>
          {activity.description ? (
            <p className="text-on-surface-variant text-xs truncate max-w-40">{activity.description}</p>
          ) : (
            <p className="text-on-surface-variant text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(activity.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>
      </div>

      {/* Right: points + status */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {activity.points_awarded > 0 && (
          <span className="flex items-center gap-1 text-primary text-sm font-bold">
            <Zap className="w-3 h-3" />
            +{activity.points_awarded} pts
          </span>
        )}
        {activity.carbon_saved > 0 && (
          <span className="hidden md:flex items-center gap-1 text-secondary text-xs">
            <Leaf className="w-3 h-3" />{activity.carbon_saved.toFixed(1)}kg
          </span>
        )}
        <span className={`badge-chip text-xs ${status.className}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>
    </motion.div>
  )
}
