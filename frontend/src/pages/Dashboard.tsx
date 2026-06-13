import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
  TrendingUp, Target, Star,
  LayoutDashboard, Gift, BarChart3, LogOut
} from 'lucide-react'

const sidebarItems = [
  { path: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/upload',      label: 'Upload',       icon: Upload },
  { path: '/leaderboard', label: 'Leaderboard',  icon: Trophy },
  { path: '/rewards',     label: 'Rewards',      icon: Gift },
  { path: '/impact',      label: 'Impact',       icon: BarChart3 },
]

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
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

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Sidebar (Desktop) ──────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-outline-variant/40 fixed h-full z-40 top-0 pt-16">
        <div className="px-4 py-6">
          <nav className="space-y-1">
            {sidebarItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={location.pathname === path ? 'sidebar-link-active' : 'sidebar-link'}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-6 border-t border-outline-variant/40 pt-4">
          <Link
            to="/upload"
            id="dashboard-upload-btn"
            className="w-full flex items-center justify-center gap-2 btn-primary text-sm mb-2"
          >
            <Upload className="w-4 h-4" /> Quick Upload
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 text-on-surface-variant hover:text-error text-sm py-2 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 pt-20 pb-12 px-4 md:px-8 max-w-full">
        <div className="max-w-6xl mx-auto">

          {/* Welcome header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-primary overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary text-xl font-bold">{user.name[0]?.toUpperCase()}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-on-background font-geist">
                  Welcome back, <span className="text-primary">{user.name.split(' ')[0]}</span>!
                </h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-secondary text-sm font-semibold">Level {user.level}: {levelInfo.label}</span>
                  <div className="w-28 h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-container rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progress}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-on-surface-variant text-xs">{Math.round(levelInfo.progress)}% to next</span>
                </div>
              </div>
            </div>
            <Link
              to="/upload"
              className="flex items-center gap-2 btn-primary text-sm"
            >
              <Upload className="w-4 h-4" /> Upload Action
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Points"       value={user.points.toLocaleString()} icon={<Zap className="w-5 h-5" />}    subtitle={`Level ${user.level} · ${levelInfo.label}`} color="green"   index={0} />
            <StatCard title="National Rank"      value={userRank > 0 ? `#${userRank}` : 'Unranked'}                         icon={<Trophy className="w-5 h-5" />}  subtitle="Among all users"               color="emerald" index={1} />
            <StatCard title="Carbon Saved"       value={`${user.carbon_saved.toFixed(1)}kg`}                                icon={<Leaf className="w-5 h-5" />}    subtitle="CO₂ equivalent"                color="blue"    index={2} />
            <StatCard title="Day Streak"         value={user.streak_days}                                                   icon={<Flame className="w-5 h-5" />}   subtitle={user.streak_days > 0 ? '🔥 Keep it up!' : 'Upload today!'} color="orange" index={3} />
          </div>

          {/* Level Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-on-surface font-semibold">Level {user.level} — {levelInfo.label}</h3>
                  <p className="text-on-surface-variant text-xs">
                    {levelInfo.next ? `${levelInfo.next.min - user.points} pts to ${levelInfo.next.label}` : 'Max Level! 🏆'}
                  </p>
                </div>
              </div>
              <span className="text-primary font-bold">{Math.round(levelInfo.progress)}%</span>
            </div>
            <div className="progress-bar mb-4">
              <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${levelInfo.progress}%` }} transition={{ duration: 1, delay: 0.6 }} />
            </div>
            {/* Impact equivalences */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Trees Equiv.',      value: Math.floor(user.carbon_saved / 20), icon: '🌳' },
                { label: 'km Driving Saved',  value: Math.floor(user.carbon_saved * 5),  icon: '🚗' },
                { label: 'Plastic Bags Saved', value: Math.floor(user.points * 0.5),     icon: '🛍️' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-surface-container rounded-xl p-3 text-center">
                  <p className="text-2xl mb-1">{icon}</p>
                  <p className="text-on-surface font-bold">{value}</p>
                  <p className="text-on-surface-variant text-xs">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activities + Leaderboard split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recent Activities */}
            <div className="lg:col-span-2 space-y-6">
              {/* Activity list */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-on-background font-bold text-lg flex items-center gap-2 font-geist">
                    <Target className="w-5 h-5 text-primary" /> Recent Activity
                  </h2>
                  <Link to="/profile" className="text-primary text-sm font-medium hover:text-secondary transition-colors">View All</Link>
                </div>
                <div className="glass-card overflow-hidden">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl shimmer" />)}
                    </div>
                  ) : recentActivities.length > 0 ? (
                    recentActivities.map((a, i) => <ActivityCard key={a.id} activity={a} index={i} />)
                  ) : (
                    <div className="p-12 text-center">
                      <div className="text-4xl mb-3">📸</div>
                      <p className="text-on-surface-variant font-medium">No activities yet</p>
                      <p className="text-on-surface-variant/60 text-sm mt-1">Upload your first eco action!</p>
                      <Link to="/upload" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
                        <Upload className="w-4 h-4" /> Upload Now
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-on-background font-bold text-lg font-geist">My Badges</h2>
                  <span className="text-primary text-sm font-medium ml-auto">{user.badges?.length || 0} earned</span>
                </div>
                {user.badges && user.badges.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {user.badges.slice(0, 8).map((badge, i) => (
                      <div key={badge.id} className="glass-card p-3 flex flex-col items-center text-center hover:border-primary/40 transition-colors cursor-default" title={badge.name}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mb-2 text-2xl">
                          {badge.icon}
                        </div>
                        <p className="text-on-surface text-xs font-semibold truncate w-full">{badge.name.split(' ')[0]}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center">
                    <p className="text-on-surface-variant text-sm">No badges yet — upload your first action!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar: Leaderboard + promo */}
            <aside className="space-y-6">
              {/* Leaderboard */}
              <div className="glass-card overflow-hidden">
                <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant/40 flex items-center justify-between">
                  <h3 className="text-on-background font-bold flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" /> Top Rangers
                  </h3>
                  <Link to="/leaderboard" className="text-primary text-xs font-medium hover:text-secondary">Full List</Link>
                </div>
                <div>
                  {topUsers.map(entry => (
                    <LeaderboardRow
                      key={entry.id}
                      entry={entry}
                      isCurrentUser={entry.id === user.id}
                    />
                  ))}
                  {topUsers.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-on-surface-variant text-sm">Loading leaderboard...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Glassmorphic promo card */}
              <div className="relative rounded-xl overflow-hidden p-5 border border-primary/20 glass-surface">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <h4 className="text-primary font-bold text-lg mb-2 font-geist">Weekend Challenge!</h4>
                  <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
                    Plant 2 trees this weekend to earn the rare 'Flora Guardian' badge and 500 bonus points.
                  </p>
                  <Link
                    to="/upload"
                    className="w-full flex items-center justify-center gap-2 border border-primary text-primary px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary hover:text-on-primary transition-all"
                  >
                    Opt In
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
