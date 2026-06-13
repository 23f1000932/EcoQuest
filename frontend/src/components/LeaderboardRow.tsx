import type { LeaderboardEntry } from '../types'
import { Leaf } from 'lucide-react'

interface Props {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
}

const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function LeaderboardRow({ entry, isCurrentUser }: Props) {
  const medal = medals[entry.rank]

  return (
    <div
      id={`leaderboard-row-${entry.rank}`}
      className={`flex items-center gap-3 px-4 py-3 border-b border-outline-variant/30 last:border-0 transition-colors ${
        isCurrentUser
          ? 'bg-primary/5 hover:bg-primary/10'
          : 'hover:bg-surface-container-lowest'
      }`}
    >
      {/* Rank */}
      <div className="w-8 text-center flex-shrink-0">
        {medal ? (
          <span className="text-lg">{medal}</span>
        ) : (
          <span className={`font-bold text-sm ${isCurrentUser ? 'text-primary' : 'text-on-surface-variant'}`}>
            {entry.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
        isCurrentUser ? 'ring-2 ring-primary' : ''
      }`}>
        {entry.avatar_url ? (
          <img src={entry.avatar_url} alt={entry.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-surface-container flex items-center justify-center">
            <span className={`text-xs font-bold ${isCurrentUser ? 'text-primary' : 'text-on-surface-variant'}`}>
              {entry.name[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Name & level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className={`font-semibold text-sm truncate ${isCurrentUser ? 'text-primary' : 'text-on-background'}`}>
            {isCurrentUser ? 'You' : entry.name}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {entry.badges.slice(0, 2).map(b => (
            <span key={b.id} className="text-xs" title={b.name}>{b.icon}</span>
          ))}
          <span className="flex items-center gap-0.5 text-secondary text-xs ml-1">
            <Leaf className="w-3 h-3" />{entry.carbon_saved.toFixed(1)}kg
          </span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <span className={`font-bold text-sm ${isCurrentUser ? 'text-primary' : 'text-on-surface-variant'}`}>
          {entry.points.toLocaleString()} pt
        </span>
      </div>
    </div>
  )
}
