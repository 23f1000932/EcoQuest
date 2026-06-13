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
        <h1 className="text-3xl font-black text-on-background flex items-center gap-3 font-geist">
          <Gift className="w-8 h-8 text-primary" /> Rewards Catalog
        </h1>
        <p className="text-on-surface-variant mt-1">Redeem your eco points for real rewards</p>
        {user && (
          <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-primary font-semibold">{user.points.toLocaleString()} points available</span>
          </div>
        )}
      </motion.div>

      {/* Rewards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward, i) => {
            const affordable  = canAfford(reward.points_req)
            const wasRedeemed = redeemed.includes(reward.id)
            const isRedeeming = redeeming === reward.id

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-6 flex flex-col gap-4 transition-all duration-300 ${
                  affordable ? 'hover:-translate-y-1 hover:shadow-card-hover hover:border-primary/30' : 'opacity-70'
                }`}
              >
                {/* Out of stock */}
                {reward.stock === 0 && (
                  <div className="absolute top-3 right-3 bg-error-container/60 text-on-error-container text-xs font-medium px-2 py-0.5 rounded-full border border-error/20">
                    Out of Stock
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${affordable ? 'bg-primary/10' : 'bg-surface-container'}`}>
                  {reward.icon}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-on-surface font-bold">{reward.title}</h3>
                  {reward.description && (
                    <p className="text-on-surface-variant text-sm mt-1">{reward.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`font-black text-lg ${affordable ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {reward.points_req.toLocaleString()} pts
                    </span>
                    {!affordable && user && (
                      <span className="text-on-surface-variant text-xs">
                        (Need {(reward.points_req - user.points).toLocaleString()} more)
                      </span>
                    )}
                  </div>
                  {reward.stock > 0 && reward.stock <= 20 && (
                    <p className="text-orange-500 text-xs mt-1">⚠️ Only {reward.stock} left</p>
                  )}
                </div>

                {/* Button */}
                <button
                  id={`redeem-btn-${reward.id}`}
                  onClick={() => handleRedeem(reward)}
                  disabled={!affordable || isRedeeming || wasRedeemed || reward.stock === 0}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    wasRedeemed
                      ? 'bg-secondary-container/30 text-on-secondary-container border border-secondary-container/50 cursor-default'
                      : affordable && reward.stock !== 0
                      ? 'btn-primary'
                      : 'bg-surface-container text-on-surface-variant cursor-not-allowed border border-outline-variant'
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
        <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl">💡</span>
        </div>
        <div>
          <p className="text-on-surface font-medium text-sm">How rewards work</p>
          <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
            Points are deducted immediately upon redemption. Digital rewards (certificates, gift cards) are delivered within 48 hours to your registered email.
            Physical rewards require your shipping address. Contact us if you have questions.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
