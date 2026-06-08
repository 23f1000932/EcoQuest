import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../api/client'
import type { Activity, ActivityListResponse, LeaderboardEntry } from '../types'
import { getLevelInfo } from '../types'
import StatCard from '../components/StatCard'
import ActivityCard from '../components/ActivityCard'
import LeaderboardRow from '../components/LeaderboardRow'
import {
  Zap, Leaf, Trophy, Flame, Upload,
  TrendingUp, Target, Star
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiClient.get<ActivityListResponse>('/activities/history?page=1&limit=5'),
      apiClient.get<LeaderboardEntry[]>('/leaderboard?limit=5'),
    ]).then(([activitiesRes, lbRes]) => {
      setRecentActivities(activitiesRes.data.activities)
      setTopUsers(lbRes.data)
    }).finally(() => setLoading(false))
  }, [])

  if (!user) return null
  const levelInfo = getLevelInfo(user.points)

  const userRank = topUsers.findIndex(u => u.id === user.id) + 1

  return (
    <div className="page-container">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">
              Welcome back, <span className="gradient-text">{user.name.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-white/40 mt-1">Keep up the great eco work!</p>
          </div>
          <Link to="/upload" id="dashboard-upload-btn" className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Action
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Points"
          value={user.points.toLocaleString()}
          icon={<Zap className="w-5 h-5" />}
          subtitle={`Level ${user.level} · ${levelInfo.label}`}
          color="green"
          index={0}
        />
        <StatCard
          title="National Rank"
          value={userRank > 0 ? `#${userRank}` : 'Unranked'}
          icon={<Trophy className="w-5 h-5" />}
          subtitle="Among all users"
          color="emerald"
          index={1}
        />
        <StatCard
          title="Carbon Saved"
          value={`${user.carbon_saved.toFixed(1)}kg`}
          icon={<Leaf className="w-5 h-5" />}
          subtitle="CO₂ equivalent"
          color="blue"
          index={2}
        />
        <StatCard
          title="Day Streak"
          value={user.streak_days}
          icon={<Flame className="w-5 h-5" />}
          subtitle={user.streak_days > 0 ? '🔥 Keep it up!' : 'Upload today to start'}
          color="orange"
          index={3}
        />
      </div>

      {/* Level Progress + Badges Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Level {user.level} — {levelInfo.label}</h3>
                <p className="text-white/40 text-xs">
                  {levelInfo.next ? `${levelInfo.next.min - user.points} pts to ${levelInfo.next.label}` : 'Max Level Reached! 🏆'}
                </p>
              </div>
            </div>
            <span className="text-green-400 font-bold">{Math.round(levelInfo.progress)}%</span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progress}%` }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </div>
          {/* Impact equivalences */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Trees Equiv.', value: Math.floor(user.carbon_saved / 20), icon: '🌳' },
              { label: 'km Driving Saved', value: Math.floor(user.carbon_saved * 5), icon: '🚗' },
              { label: 'Plastic Bags Saved', value: Math.floor(user.points * 0.5), icon: '🛍️' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white/3 rounded-xl p-3 text-center">
                <p className="text-2xl mb-1">{icon}</p>
                <p className="text-white font-bold">{value}</p>
                <p className="text-white/30 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white font-semibold">Badges</h3>
            </div>
            <span className="text-green-400 text-sm font-medium">{user.badges?.length || 0} earned</span>
          </div>
          {user.badges && user.badges.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {user.badges.slice(0, 6).map(badge => (
                <div key={badge.id} className="flex flex-col items-center gap-1 p-2 bg-white/3 rounded-xl" title={badge.name}>
                  <span className="text-2xl">{badge.icon}</span>
                  <p className="text-white/60 text-xs text-center truncate w-full">{badge.name.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-center">
              <p className="text-white/30 text-sm">No badges yet</p>
              <p className="text-white/20 text-xs mt-1">Upload your first action!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activities + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" /> Recent Activities
            </h2>
            <Link to="/profile" className="text-green-400/60 hover:text-green-400 text-sm transition-colors">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/3 shimmer" />)}
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((a, i) => <ActivityCard key={a.id} activity={a} index={i} />)}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">📸</div>
              <p className="text-white/40 font-medium">No activities yet</p>
              <p className="text-white/20 text-sm mt-1">Upload your first eco action to get started!</p>
              <Link to="/upload" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
                <Upload className="w-4 h-4" /> Upload Now
              </Link>
            </div>
          )}
        </div>

        {/* Leaderboard Preview */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" /> Top Players
            </h2>
            <Link to="/leaderboard" className="text-green-400/60 hover:text-green-400 text-sm transition-colors">Full board →</Link>
          </div>
          <div className="space-y-2">
            {topUsers.map(entry => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                isCurrentUser={entry.id === user.id}
              />
            ))}
            {topUsers.length === 0 && (
              <div className="glass-card p-8 text-center">
                <p className="text-white/30 text-sm">Loading leaderboard...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
