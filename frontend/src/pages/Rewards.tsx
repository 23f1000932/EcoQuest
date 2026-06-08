import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../api/client'
import type { Reward } from '../types'
import { Gift, Lock, CheckCircle, Loader2, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Rewards() {
  const { user, refreshUser } = useAuth()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [redeemed, setRedeemed] = useState<string[]>([])

  useEffect(() => {
    apiClient.get('/rewards').then(r => {
      setRewards(r.data)
      setLoading(false)
    })
  }, [])

  const handleRedeem = async (reward: Reward) => {
    if (!user || user.points < reward.points_req) return
    setRedeeming(reward.id)
    try {
      const res = await apiClient.post(`/rewards/${reward.id}/redeem`)
      toast.success(res.data.message || 'Reward redeemed!', { duration: 5000 })
      setRedeemed(prev => [...prev, reward.id])
      await refreshUser()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Redemption failed')
    } finally {
      setRedeeming(null)
    }
  }

  const canAfford = (pts: number) => user && user.points >= pts

  return (
    <div className="page-container max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Gift className="w-8 h-8 text-green-400" /> Rewards Catalog
        </h1>
        <p className="text-white/40 mt-1">Redeem your eco points for real rewards</p>
        {user && (
          <div className="mt-3 inline-flex items-center gap-2 bg-green-500/15 border border-green-500/25 rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-green-300 font-semibold">{user.points.toLocaleString()} points available</span>
          </div>
        )}
      </motion.div>

      {/* Rewards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/3 shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward, i) => {
            const affordable = canAfford(reward.points_req)
            const wasRedeemed = redeemed.includes(reward.id)
            const isRedeeming = redeeming === reward.id

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative glass-card p-6 flex flex-col gap-4 transition-all duration-300 ${
                  affordable ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 hover:border-green-400/40' : 'opacity-70'
                }`}
              >
                {/* Out of stock badge */}
                {reward.stock === 0 && (
                  <div className="absolute top-3 right-3 bg-red-500/20 text-red-400 text-xs font-medium px-2 py-0.5 rounded-full border border-red-500/30">
                    Out of Stock
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${
                  affordable ? 'bg-green-500/15' : 'bg-white/5'
                }`}>
                  {reward.icon}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-white font-bold">{reward.title}</h3>
                  {reward.description && (
                    <p className="text-white/40 text-sm mt-1">{reward.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`font-black text-lg ${affordable ? 'text-green-400' : 'text-white/40'}`}>
                      {reward.points_req.toLocaleString()} pts
                    </span>
                    {!affordable && user && (
                      <span className="text-white/30 text-xs">
                        (Need {(reward.points_req - user.points).toLocaleString()} more)
                      </span>
                    )}
                  </div>
                  {reward.stock > 0 && reward.stock <= 20 && (
                    <p className="text-orange-400/70 text-xs mt-1">⚠️ Only {reward.stock} left</p>
                  )}
                </div>

                {/* Button */}
                <button
                  id={`redeem-btn-${reward.id}`}
                  onClick={() => handleRedeem(reward)}
                  disabled={!affordable || isRedeeming || wasRedeemed || reward.stock === 0}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                    wasRedeemed
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30 cursor-default'
                      : affordable && reward.stock !== 0
                      ? 'btn-primary'
                      : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                  }`}
                >
                  {isRedeeming ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : wasRedeemed ? (
                    <><CheckCircle className="w-4 h-4" /> Redeemed!</>
                  ) : affordable && reward.stock !== 0 ? (
                    <><ShoppingBag className="w-4 h-4" /> Redeem Now</>
                  ) : (
                    <><Lock className="w-4 h-4" /> {reward.stock === 0 ? 'Out of Stock' : 'Locked'}</>
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 glass-card p-5 flex items-start gap-3"
      >
        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl">💡</span>
        </div>
        <div>
          <p className="text-white font-medium text-sm">How rewards work</p>
          <p className="text-white/40 text-xs mt-1">
            Points are deducted immediately upon redemption. Digital rewards (certificates, gift cards) are delivered within 48 hours to your registered email.
            Physical rewards require your shipping address. Contact us if you have questions.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
