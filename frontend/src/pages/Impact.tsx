import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend
} from 'recharts'
import { apiClient } from '../api/client'
import type { ImpactStats } from '../types'
import { Leaf, Users, Zap, TreePine, Wind, Bike } from 'lucide-react'

const COLORS = ['#22c55e', '#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16']

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
  { name: 'Tree Plantation', value: 28, carbon: 20.0 },
  { name: 'Community Cleanup', value: 19, carbon: 5.0 },
  { name: 'Cycling', value: 16, carbon: 1.5 },
  { name: 'Public Transport', value: 14, carbon: 2.5 },
  { name: 'Waste Segregation', value: 11, carbon: 1.0 },
  { name: 'Reusable Bottle', value: 7, carbon: 0.5 },
  { name: 'Cloth Bag', value: 5, carbon: 0.3 },
]

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
    { icon: Users, label: 'Users Joined', value: s.total_users, suffix: '', color: 'green' as const },
    { icon: Zap, label: 'Actions Logged', value: s.total_activities, suffix: '', color: 'emerald' as const },
    { icon: TreePine, label: 'Trees Planted', value: s.trees_planted, suffix: '', color: 'blue' as const },
    { icon: Wind, label: 'CO₂ Saved (kg)', value: Math.round(s.total_carbon_saved), suffix: '', color: 'purple' as const },
    { icon: Bike, label: 'Cycling Trips', value: s.cycling_trips, suffix: '', color: 'orange' as const },
    { icon: Leaf, label: 'Transport Trips', value: s.public_transport_trips, suffix: '', color: 'green' as const },
  ]

  return (
    <div className="page-container max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Leaf className="w-8 h-8 text-green-400" /> Platform Impact
        </h1>
        <p className="text-white/40 mt-1">Real environmental change driven by our community</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {impactCards.map(({ icon: Icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4 text-center"
          >
            <Icon className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-white text-xl font-black">
              <AnimatedNumber value={value} />
            </p>
            <p className="text-white/40 text-xs mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Equivalences Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 mb-10 bg-gradient-to-r from-green-900/30 to-emerald-900/20"
      >
        <h2 className="text-white font-bold mb-4 text-center">Your collective impact is equivalent to...</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: '🌳', label: 'Trees planted', value: Math.round(s.total_carbon_saved / 20) },
            { icon: '🚗', label: 'km of driving avoided', value: Math.round(s.total_carbon_saved * 5).toLocaleString() },
            { icon: '💡', label: 'Light bulb hours', value: Math.round(s.total_carbon_saved * 100).toLocaleString() },
            { icon: '✈️', label: 'Flight hours offset', value: Math.round(s.total_carbon_saved / 90) },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-white/3 rounded-2xl p-4">
              <span className="text-3xl block mb-2">{icon}</span>
              <p className="text-white font-black text-xl">{value}</p>
              <p className="text-white/40 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Area Chart */}
        <div className="lg:col-span-3 glass-card p-6">
          <h3 className="text-white font-bold mb-6">Monthly Activity Growth</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="treeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cycleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 12 }} />
              <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#0a0f0a', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="trees" name="Trees" stroke="#22c55e" fill="url(#treeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="cycling" name="Cycling" stroke="#10b981" fill="url(#cycleGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-white font-bold mb-4">Activity Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={activityBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {activityBreakdown.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0a0f0a', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', color: '#fff' }}
                formatter={(v: number) => [`${v}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {activityBreakdown.slice(0, 4).map(({ name, value }, idx) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[idx] }} />
                  <span className="text-white/50 text-xs">{name}</span>
                </div>
                <span className="text-white/70 text-xs font-medium">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carbon by Activity Bar Chart */}
      <div className="glass-card p-6">
        <h3 className="text-white font-bold mb-6">Carbon Saved per Activity Type (kg CO₂)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={activityBreakdown} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <XAxis dataKey="name" stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
            <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#0a0f0a', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', color: '#fff' }} />
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
