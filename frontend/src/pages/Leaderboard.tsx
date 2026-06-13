import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useLeaderboard } from '../hooks/useLeaderboard'
import LeaderboardRow from '../components/LeaderboardRow'
import { Trophy, Search, Leaf, Users } from 'lucide-react'

export default function Leaderboard() {
  const { user } = useAuth()
  const { data: leaderboard, loading } = useLeaderboard(100)
  const [search, setSearch] = useState('')

  const filtered = leaderboard.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-on-background flex items-center gap-3 font-geist">
          <Trophy className="w-8 h-8 text-yellow-500" />
          National Leaderboard
        </h1>
        <p className="text-on-surface-variant mt-1">Top eco warriors across India</p>
      </motion.div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-end justify-center gap-6">
            {/* 2nd place */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-300 bg-surface-container">
                {leaderboard[1].avatar_url
                  ? <img src={leaderboard[1].avatar_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-bold text-xl">{leaderboard[1].name[0]}</div>}
              </div>
              <p className="text-on-surface-variant text-sm font-medium max-w-20 text-center truncate">{leaderboard[1].name}</p>
              <div className="bg-surface-container border border-outline-variant rounded-lg px-3 py-1">
                <p className="text-on-surface-variant font-bold text-sm">{leaderboard[1].points.toLocaleString()} pts</p>
              </div>
              <div className="bg-outline/20 w-20 h-16 rounded-t-xl flex items-start justify-center pt-2">
                <span className="text-2xl">🥈</span>
              </div>
            </div>

            {/* 1st place */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-yellow-400 bg-surface-container"
                style={{ boxShadow: '0 0 20px rgba(234,179,8,0.3)' }}>
                {leaderboard[0].avatar_url
                  ? <img src={leaderboard[0].avatar_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-on-surface font-bold text-2xl">{leaderboard[0].name[0]}</div>}
              </div>
              <p className="text-on-background font-bold max-w-24 text-center truncate">{leaderboard[0].name}</p>
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-1">
                <p className="text-primary font-bold">{leaderboard[0].points.toLocaleString()} pts</p>
              </div>
              <div className="bg-yellow-400 w-20 h-24 rounded-t-xl flex items-start justify-center pt-2">
                <span className="text-2xl">🥇</span>
              </div>
            </div>

            {/* 3rd place */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-amber-600 bg-surface-container">
                {leaderboard[2].avatar_url
                  ? <img src={leaderboard[2].avatar_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-bold text-xl">{leaderboard[2].name[0]}</div>}
              </div>
              <p className="text-on-surface-variant text-sm font-medium max-w-20 text-center truncate">{leaderboard[2].name}</p>
              <div className="bg-surface-container border border-outline-variant rounded-lg px-3 py-1">
                <p className="text-on-surface-variant font-bold text-sm">{leaderboard[2].points.toLocaleString()} pts</p>
              </div>
              <div className="bg-amber-600 w-20 h-12 rounded-t-xl flex items-start justify-center pt-2">
                <span className="text-2xl">🥉</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search + count */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            id="leaderboard-search"
            type="text"
            placeholder="Search by name..."
            className="input-field pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant text-sm">
          <Users className="w-4 h-4" />
          <span>{leaderboard.length} players</span>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl shimmer" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map(entry => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              isCurrentUser={entry.id === user?.id}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-on-surface-variant">No users found matching "{search}"</p>
          </div>
        )}
      </div>

      {/* Carbon Impact Footer */}
      <div className="mt-6 glass-card p-5 flex items-center justify-center gap-12 text-center">
        <div>
          <Leaf className="w-5 h-5 text-secondary mx-auto mb-1" />
          <p className="text-on-background font-bold">{leaderboard.reduce((s, e) => s + e.carbon_saved, 0).toFixed(0)}kg</p>
          <p className="text-on-surface-variant text-xs">Total CO₂ Saved</p>
        </div>
        <div>
          <span className="text-2xl block mb-1">🌳</span>
          <p className="text-on-background font-bold">{leaderboard.reduce((s, e) => s + e.points, 0).toLocaleString()}</p>
          <p className="text-on-surface-variant text-xs">Total Points</p>
        </div>
      </div>
    </div>
  )
}
