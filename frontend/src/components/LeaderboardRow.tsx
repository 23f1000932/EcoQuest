import type { LeaderboardEntry } from '../types'
import { Leaf } from 'lucide-react'

interface Props {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
}

const medals: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

const levelEmoji: Record<number, string> = {
  1: '🌱', 2: '🌿', 3: '🌳', 4: '🌲', 5: '🏔️', 6: '⭐'
}

export default function LeaderboardRow({ entry, isCurrentUser }: Props) {
  const medal = medals[entry.rank]

  return (
    <div
      id={`leaderboard-row-${entry.rank}`}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
        isCurrentUser
          ? 'bg-green-500/15 border border-green-400/40 shadow-lg shadow-green-500/10'
          : entry.rank <= 3
          ? 'bg-white/5 border border-white/10 hover:bg-white/8'
          : 'hover:bg-white/3 border border-transparent hover:border-white/5'
      }`}
    >
      {/* Rank */}
      <div className="w-10 text-center flex-shrink-0">
        {medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="text-white/40 font-mono text-sm font-medium">#{entry.rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
        entry.rank === 1 ? 'ring-2 ring-yellow-400' :
        entry.rank === 2 ? 'ring-2 ring-gray-300' :
        entry.rank === 3 ? 'ring-2 ring-amber-600' : ''
      }`}>
        {entry.avatar_url ? (
          <img src={entry.avatar_url} alt={entry.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{entry.name[0]?.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Name & Level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm truncate ${isCurrentUser ? 'text-green-300' : 'text-white'}`}>
            {entry.name}
            {isCurrentUser && <span className="text-green-400/60 ml-1 text-xs">(You)</span>}
          </span>
          <span className="text-xs">{levelEmoji[entry.level] || '🌱'}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {entry.badges.slice(0, 3).map(b => (
            <span key={b.id} className="text-xs" title={b.name}>{b.icon}</span>
          ))}
          <span className="flex items-center gap-0.5 text-emerald-400/60 text-xs ml-1">
            <Leaf className="w-3 h-3" /> {entry.carbon_saved.toFixed(1)}kg
          </span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <span className={`font-bold text-sm ${isCurrentUser ? 'text-green-400' : 'text-white'}`}>
          {entry.points.toLocaleString()}
        </span>
        <p className="text-white/30 text-xs">points</p>
      </div>
    </div>
  )
}
