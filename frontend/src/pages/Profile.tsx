import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../api/client'
import type { Activity, ActivityListResponse, Badge } from '../types'
import { getLevelInfo } from '../types'
import ActivityCard from '../components/ActivityCard'
import BadgeCard from '../components/BadgeCard'
import { Edit2, Check, X, Leaf, Zap, Trophy, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const url = filter === 'all'
      ? `/activities/history?page=${page}&limit=6`
      : `/activities/history?page=${page}&limit=6&status=${filter}`
    apiClient.get<ActivityListResponse>(url).then(r => {
      setActivities(r.data.activities)
      setTotal(r.data.total)
      setPages(r.data.pages)
    })
    apiClient.get<Badge[]>('/badges').then(r => setAllBadges(r.data))
  }, [page, filter])

  const handleSaveName = async () => {
    if (!name.trim()) return
    try {
      await apiClient.put('/users/me', { name: name.trim() })
      await refreshUser()
      setEditing(false)
      toast.success('Name updated!')
    } catch {
      toast.error('Failed to update name')
    }
  }

  if (!user) return null
  const levelInfo = getLevelInfo(user.points)
  const earnedBadgeIds = new Set(user.badges?.map(b => b.id) || [])

  return (
    <div className="page-container max-w-4xl">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-black">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Lv.{user.level}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            {editing ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  id="profile-name-input"
                  className="input-field max-w-xs text-xl font-bold py-1.5"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-2 bg-green-500/20 rounded-xl text-green-400 hover:bg-green-500/30"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditing(false)} className="p-2 bg-white/5 rounded-xl text-white/40 hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">{user.name}</h1>
                <button id="edit-name-btn" onClick={() => setEditing(true)} className="p-1 text-white/30 hover:text-white/60">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-white/40 text-sm">{user.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3 justify-center sm:justify-start">
              <span className="badge-chip bg-green-500/15 text-green-400 border border-green-500/20">
                🌱 {levelInfo.label}
              </span>
              <span className="text-white/30 text-sm flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            {[
              { label: 'Points', value: user.points.toLocaleString(), icon: <Zap className="w-3.5 h-3.5" />, color: 'text-green-400' },
              { label: 'CO₂ Saved', value: `${user.carbon_saved.toFixed(1)}kg`, icon: <Leaf className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
              { label: 'Streak', value: `${user.streak_days}d 🔥`, icon: null, color: 'text-orange-400' },
              { label: 'Badges', value: user.badges?.length || 0, icon: <Trophy className="w-3.5 h-3.5" />, color: 'text-yellow-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white/3 rounded-xl p-3 text-center">
                <div className={`flex items-center justify-center gap-1 ${color} mb-1 text-xs`}>
                  {icon} {label}
                </div>
                <p className="text-white font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Level progress */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-white/40 mb-1.5">
            <span>{levelInfo.label}</span>
            <span>{levelInfo.next ? `${levelInfo.next.label} in ${levelInfo.next.min - user.points} pts` : '⭐ Max Level!'}</span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-white font-bold text-lg mb-4">Badges</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {allBadges.map((badge, i) => (
            <BadgeCard
              key={badge.id}
              badge={earnedBadgeIds.has(badge.id) ? (user.badges?.find(b => b.id === badge.id) || badge) : badge}
              earned={earnedBadgeIds.has(badge.id)}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Activity History */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-white font-bold text-lg">Activity History ({total})</h2>
          <div className="flex gap-2">
            {['all', 'approved', 'pending', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1) }}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === f ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {activities.map((a, i) => <ActivityCard key={a.id} activity={a} index={i} />)}
          {activities.length === 0 && (
            <div className="glass-card p-10 text-center">
              <p className="text-white/30">No activities found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-4 py-2 disabled:opacity-30">← Prev</button>
            <span className="text-white/40 text-sm">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary text-sm px-4 py-2 disabled:opacity-30">Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
