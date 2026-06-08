import { motion } from 'framer-motion'
import type { Activity } from '../types'
import { ACTIVITY_ICONS } from '../types'
import { Calendar, CheckCircle, Clock, XCircle, Zap, Leaf } from 'lucide-react'

interface Props {
  activity: Activity
  index?: number
}

const statusConfig = {
  approved: { icon: CheckCircle, label: 'Approved', className: 'status-approved' },
  pending: { icon: Clock, label: 'Pending', className: 'status-pending' },
  rejected: { icon: XCircle, label: 'Rejected', className: 'status-rejected' },
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
      className="glass-card-hover p-4 flex gap-4"
    >
      {/* Image or icon */}
      <div className="flex-shrink-0">
        {activity.image_url && !activity.image_url.includes('placeholder') ? (
          <img
            src={activity.image_url}
            alt={activity.activity_type}
            className="w-16 h-16 rounded-xl object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-800 to-emerald-900 flex items-center justify-center text-2xl">
            {icon}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-white font-semibold text-sm">{activity.activity_type}</h3>
            {activity.description && (
              <p className="text-white/40 text-xs mt-0.5 truncate">{activity.description}</p>
            )}
          </div>
          <span className={`badge-chip text-xs flex-shrink-0 ${status.className}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-2">
          {activity.points_awarded > 0 && (
            <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
              <Zap className="w-3 h-3" /> +{activity.points_awarded} pts
            </span>
          )}
          {activity.carbon_saved > 0 && (
            <span className="flex items-center gap-1 text-emerald-400 text-xs">
              <Leaf className="w-3 h-3" /> {activity.carbon_saved.toFixed(1)}kg CO₂
            </span>
          )}
          <span className="flex items-center gap-1 text-white/30 text-xs ml-auto">
            <Calendar className="w-3 h-3" />
            {new Date(activity.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {activity.rejection_note && (
          <p className="text-red-400/70 text-xs mt-1.5 italic">"{activity.rejection_note}"</p>
        )}

        {activity.ai_response?.reason && activity.status === 'approved' && (
          <p className="text-green-400/50 text-xs mt-1.5 italic">"{activity.ai_response.reason}"</p>
        )}
      </div>
    </motion.div>
  )
}
