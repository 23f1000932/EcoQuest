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

// Icon bg color per variant — stays within primary/secondary/tertiary palette on light surface
const iconColorMap = {
  green:   'bg-primary/10 text-primary',
  emerald: 'bg-secondary/10 text-secondary',
  blue:    'bg-tertiary/10 text-tertiary',
  purple:  'bg-surface-container-high text-on-surface-variant',
  orange:  'bg-tertiary-container/30 text-tertiary',
}

export default function StatCard({ title, value, icon, subtitle, color = 'green', index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-5"
      style={{ boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
          <p className="text-on-background text-2xl font-bold font-geist text-primary">{value}</p>
          {subtitle && <p className="text-on-surface-variant text-xs mt-1.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColorMap[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
