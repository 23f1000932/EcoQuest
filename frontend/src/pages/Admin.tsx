import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiClient } from '../api/client'
import type { } from '../types'
import { ACTIVITY_ICONS } from '../types'
import { CheckCircle, XCircle, Clock, ShieldCheck, Users, BarChart3, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

type Tab = 'pending' | 'all' | 'users' | 'stats'

export default function Admin() {
  const [tab, setTab] = useState<Tab>('pending')
  const [activities, setActivities] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({})

  const loadData = async (t: Tab) => {
    setLoading(true)
    try {
      if (t === 'pending') {
        const r = await apiClient.get('/admin/activities?status=pending')
        setActivities(r.data.activities)
      } else if (t === 'all') {
        const r = await apiClient.get('/admin/activities?status=approved')
        setActivities(r.data.activities)
      } else if (t === 'users') {
        const r = await apiClient.get('/admin/users')
        setUsers(r.data.users)
      } else {
        const r = await apiClient.get('/admin/stats')
        setStats(r.data)
      }
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  // eslint-disable-next-line
  useEffect(() => { loadData(tab) }, [tab])

  const approve = async (id: string) => {
    await apiClient.put(`/admin/activities/${id}/approve`)
    toast.success('Activity approved!')
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  const reject = async (id: string) => {
    await apiClient.put(`/admin/activities/${id}/reject`, { note: rejectNote[id] || 'Does not meet guidelines' })
    toast.success('Activity rejected')
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  const tabs: { id: Tab; label: string; icon: typeof ShieldCheck }[] = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'all', label: 'Approved', icon: CheckCircle },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ]

  return (
    <div className="page-container max-w-6xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-purple-400" /> Admin Panel
        </h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`admin-tab-${id}`}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              tab === id ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Pending / All Activities */}
          {(tab === 'pending' || tab === 'all') && (
            <div className="space-y-4">
              {activities.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <p className="text-white/30">No {tab} activities</p>
                </div>
              )}
              {activities.map(activity => (
                <div key={activity.id} className="glass-card p-5">
                  <div className="flex gap-5 flex-wrap md:flex-nowrap">
                    {/* Image */}
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      {activity.image_url && !activity.image_url.includes('placeholder') ? (
                        <img src={activity.image_url} alt={`Uploaded photo for ${activity.activity_type}`} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {ACTIVITY_ICONS[activity.activity_type] || '🌱'}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="text-white font-bold">{activity.activity_type}</h3>
                          <p className="text-white/40 text-sm">{activity.user_name} · {activity.user_email}</p>
                          {activity.description && <p className="text-white/50 text-sm mt-1 italic">"{activity.description}"</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">{activity.confidence?.toFixed(0)}% confidence</p>
                          <p className="text-white/40 text-xs">{new Date(activity.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>

                      {activity.ai_response?.reason && (
                        <p className="text-white/40 text-xs mt-2 italic">AI: "{activity.ai_response.reason}"</p>
                      )}

                      {tab === 'pending' && (
                        <div className="flex gap-3 mt-4 flex-wrap">
                          <input
                            placeholder="Rejection reason (optional)"
                            className="input-field flex-1 text-sm py-2"
                            value={rejectNote[activity.id] || ''}
                            onChange={e => setRejectNote(p => ({ ...p, [activity.id]: e.target.value }))}
                          />
                          <button
                            id={`approve-btn-${activity.id}`}
                            onClick={() => approve(activity.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                          <button
                            id={`reject-btn-${activity.id}`}
                            onClick={() => reject(activity.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-sm font-medium"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Name', 'Email', 'Points', 'Admin', 'Joined'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-white/40 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 text-white font-medium">{u.name}</td>
                      <td className="px-5 py-3 text-white/50">{u.email}</td>
                      <td className="px-5 py-3 text-green-400 font-bold">{u.points}</td>
                      <td className="px-5 py-3">
                        <span className={`badge-chip text-xs ${u.is_admin ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-white/30 border border-white/10'}`}>
                          {u.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-white/30">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stats */}
          {tab === 'stats' && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: stats.platform.total_users, icon: '👥' },
                { label: 'Total Activities', value: stats.platform.total_activities, icon: '⚡' },
                { label: 'CO₂ Saved (kg)', value: stats.platform.total_carbon_saved?.toFixed(0), icon: '💨' },
                { label: 'Pending Review', value: stats.pending_activities, icon: '⏳' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="glass-card p-6 text-center">
                  <span className="text-3xl block mb-2">{icon}</span>
                  <p className="text-white text-2xl font-black">{value?.toLocaleString()}</p>
                  <p className="text-white/40 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
