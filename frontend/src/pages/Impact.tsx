import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { apiClient } from '../api/client'
import type { ImpactStats } from '../types'
import { Leaf, Users, Zap, TreePine, Wind, Bike } from 'lucide-react'

// Light-mode chart colors (deep, visible on white)
const COLORS = ['#006e2f', '#006c49', '#006591', '#00714d', '#059669', '#0369a1', '#7c3aed', '#b45309']

const monthlyData = [
  { month: 'Jan', trees: 210, cleanup: 180, cycling: 340, transport: 270 },
  { month: 'Feb', trees: 320, cleanup: 250, cycling: 480, transport: 390 },
  { month: 'Mar', trees: 540, cleanup: 320, cycling: 620, transport: 510 },
  { month: 'Apr', trees: 680, cleanup: 420, cycling: 780, transport: 640 },
  { month: 'May', trees: 890, cleanup: 560, cycling: 950, transport: 820 },
  { month: 'Jun', trees: 1100, cleanup: 720, cycling: 1150, transport: 980 },
  { month: 'Jul', trees: 1340, cleanup: 890, cycling: 1380, transport: 1200 },
  { month: 'Aug', trees: 1580, cleanup: 1050, cycling: 1620, transport: 1430 },
]

const activityBreakdown = [
  { name: 'Tree Plantation',   value: 28, carbon: 20.0 },
  { name: 'Community Cleanup', value: 19, carbon: 5.0  },
  { name: 'Cycling',           value: 16, carbon: 1.5  },
  { name: 'Public Transport',  value: 14, carbon: 2.5  },
  { name: 'Waste Segregation', value: 11, carbon: 1.0  },
  { name: 'Reusable Bottle',   value: 7,  carbon: 0.5  },
  { name: 'Cloth Bag',         value: 5,  carbon: 0.3  },
]

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #bccbb9',
  borderRadius: '12px',
  color: '#0b1c30',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const step = value / 60
    let cur = 0
    const t = setInterval(() => {
      cur += step
      if (cur >= value) { setDisplay(value); clearInterval(t) }
      else setDisplay(cur)
    }, 16)
    return () => clearInterval(t)
  }, [value])
  return <>{decimals > 0 ? display.toFixed(decimals) : Math.floor(display).toLocaleString()}</>
}

export default function Impact() {
  const [stats, setStats] = useState<ImpactStats | null>(null)

  useEffect(() => {
    apiClient.get<ImpactStats>('/impact').then(r => setStats(r.data)).catch(() => {})
  }, [])

  const s = stats || {
    total_users: 1247, total_activities: 8934,
    total_carbon_saved: 42180.5, trees_planted: 3211,
    cycling_trips: 2104, public_transport_trips: 1890,
  }

  const impactCards = [
    { icon: Users,    label: 'Users Joined',    value: s.total_users,                        color: 'bg-primary/10 text-primary'   },
    { icon: Zap,      label: 'Actions Logged',  value: s.total_activities,                   color: 'bg-secondary/10 text-secondary' },
    { icon: TreePine, label: 'Trees Planted',   value: s.trees_planted,                      color: 'bg-primary/10 text-primary'   },
    { icon: Wind,     label: 'CO₂ Saved (kg)',  value: Math.round(s.total_carbon_saved),     color: 'bg-tertiary/10 text-tertiary' },
    { icon: Bike,     label: 'Cycling Trips',   value: s.cycling_trips,                      color: 'bg-secondary/10 text-secondary' },
    { icon: Leaf,     label: 'Transport Trips', value: s.public_transport_trips,             color: 'bg-primary/10 text-primary'   },
  ]

  return (
    <div className="page-container max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-on-background flex items-center gap-3 font-geist">
          <Leaf className="w-8 h-8 text-primary" /> Platform Impact
        </h1>
        <p className="text-on-surface-variant mt-1">Real environmental change driven by our community</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {impactCards.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4 text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${color} mx-auto mb-2 flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-on-background text-xl font-black font-geist">
              <AnimatedNumber value={value} />
            </p>
            <p className="text-on-surface-variant text-xs mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Equivalences Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 mb-10"
        style={{ background: 'linear-gradient(135deg, rgba(0,110,47,0.04) 0%, rgba(0,108,73,0.02) 100%)' }}
      >
        <h2 className="text-on-background font-bold mb-4 text-center font-geist">Your collective impact is equivalent to...</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: '🌳', label: 'Trees planted',          value: Math.round(s.total_carbon_saved / 20) },
            { icon: '🚗', label: 'km of driving avoided',  value: Math.round(s.total_carbon_saved * 5).toLocaleString() },
            { icon: '💡', label: 'Light bulb hours',       value: Math.round(s.total_carbon_saved * 100).toLocaleString() },
            { icon: '✈️', label: 'Flight hours offset',    value: Math.round(s.total_carbon_saved / 90) },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-surface-container rounded-2xl p-4">
              <span className="text-3xl block mb-2">{icon}</span>
              <p className="text-on-background font-black text-xl">{value}</p>
              <p className="text-on-surface-variant text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Area Chart */}
        <div className="lg:col-span-3 glass-card p-6">
          <h3 className="text-on-background font-bold mb-6 font-geist">Monthly Activity Growth</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="treeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#006e2f" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#006e2f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cycleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#006c49" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#006c49" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#bccbb9" tick={{ fill: '#6d7b6c', fontSize: 12 }} />
              <YAxis stroke="#bccbb9" tick={{ fill: '#6d7b6c', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="trees"   name="Trees"   stroke="#006e2f" fill="url(#treeGrad)"  strokeWidth={2} />
              <Area type="monotone" dataKey="cycling" name="Cycling" stroke="#006c49" fill="url(#cycleGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-on-background font-bold mb-4 font-geist">Activity Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={activityBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {activityBreakdown.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {activityBreakdown.slice(0, 4).map(({ name, value }, idx) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[idx] }} />
                  <span className="text-on-surface-variant text-xs">{name}</span>
                </div>
                <span className="text-on-surface text-xs font-medium">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-card p-6">
        <h3 className="text-on-background font-bold mb-6 font-geist">Carbon Saved per Activity Type (kg CO₂)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={activityBreakdown} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <XAxis dataKey="name" stroke="#bccbb9" tick={{ fill: '#6d7b6c', fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
            <YAxis stroke="#bccbb9" tick={{ fill: '#6d7b6c', fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="carbon" name="CO₂ Saved (kg)" radius={[6, 6, 0, 0]}>
              {activityBreakdown.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
