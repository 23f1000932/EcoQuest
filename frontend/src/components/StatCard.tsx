import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  title: string
  value: string | number
  icon: ReactNode
  subtitle?: string
  color?: 'green' | 'emerald' | 'blue' | 'purple' | 'orange'
  index?: number
}

const colorMap = {
  green: 'from-green-500/20 to-green-600/10 border-green-500/30',
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
}

const iconColorMap = {
  green: 'bg-green-500/20 text-green-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/20 text-purple-400',
  orange: 'bg-orange-500/20 text-orange-400',
}

export default function StatCard({ title, value, icon, subtitle, color = 'green', index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${colorMap[color]}`}
    >
      {/* Background glow */}
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 blur-xl bg-${color}-400`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-white/40 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColorMap[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
