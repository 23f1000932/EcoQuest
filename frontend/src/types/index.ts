// Core types matching backend schemas

export interface Badge {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  points_req: number
  color: string
  earned_at?: string
}

export interface User {
  id: string
  supabase_uid: string
  name: string
  email: string
  avatar_url?: string
  points: number
  level: number
  carbon_saved: number
  streak_days: number
  is_admin: boolean
  created_at: string
  badges?: Badge[]
}

export type ActivityStatus = 'pending' | 'approved' | 'rejected'
export type RedemptionStatus = 'pending' | 'fulfilled' | 'cancelled'

export interface Activity {
  id: string
  user_id: string
  image_url: string
  description?: string
  activity_type: string
  points_awarded: number
  carbon_saved: number
  confidence: number
  ai_response?: {
    activity: string
    confidence: number
    points: number
    carbon_saved: number
    reason: string
  }
  status: ActivityStatus
  rejection_note?: string
  created_at: string
}

export interface ActivityListResponse {
  activities: Activity[]
  total: number
  pages: number
}

export interface UploadResponse {
  activity: Activity
  message: string
  badges_earned: Badge[]
}

export interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  avatar_url?: string
  points: number
  carbon_saved: number
  level: number
  badges: Badge[]
}

export interface Reward {
  id: string
  title: string
  description?: string
  points_req: number
  stock: number
  icon: string
  is_active: boolean
}

export interface Redemption {
  id: string
  reward_id: string
  status: RedemptionStatus
  created_at: string
  reward?: Reward
}

export interface ImpactStats {
  total_users: number
  total_activities: number
  total_carbon_saved: number
  trees_planted: number
  cycling_trips: number
  public_transport_trips: number
}

export const LEVELS = [
  { level: 1, label: 'Seedling', min: 0, max: 100 },
  { level: 2, label: 'Sapling', min: 100, max: 300 },
  { level: 3, label: 'Tree', min: 300, max: 600 },
  { level: 4, label: 'Grove', min: 600, max: 1000 },
  { level: 5, label: 'Forest Guardian', min: 1000, max: 2000 },
  { level: 6, label: 'Sustainability Legend', min: 2000, max: Infinity },
]

export function getLevelInfo(points: number) {
  const current = LEVELS.find(l => points >= l.min && points < l.max) || LEVELS[LEVELS.length - 1]
  const next = LEVELS[current.level] || null
  const progress = next ? ((points - current.min) / (next.min - current.min)) * 100 : 100
  return { ...current, next, progress: Math.min(100, progress) }
}

export const ACTIVITY_ICONS: Record<string, string> = {
  'Tree Plantation': '🌳',
  'Community Cleanup': '🧹',
  'Waste Segregation': '♻️',
  'Public Transport': '🚌',
  'Cycling': '🚴',
  'Reusable Bottle': '🍶',
  'Cloth Bag': '👜',
  'Other Eco Action': '🌱',
}

export const ACTIVITY_COLORS: Record<string, string> = {
  'Tree Plantation': 'from-green-600 to-emerald-600',
  'Community Cleanup': 'from-blue-600 to-cyan-600',
  'Waste Segregation': 'from-teal-600 to-green-600',
  'Public Transport': 'from-purple-600 to-blue-600',
  'Cycling': 'from-orange-500 to-yellow-500',
  'Reusable Bottle': 'from-sky-500 to-blue-500',
  'Cloth Bag': 'from-amber-500 to-orange-500',
  'Other Eco Action': 'from-green-500 to-teal-500',
}
