import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../api/client'
import type { ImpactStats, Reward } from '../types'
import { ACTIVITY_ICONS } from '../types'
import Footer from '../components/Footer'
import {
  Leaf, ArrowRight, Zap,
  Camera, Shield, Trophy, Gift, ChevronDown, ChevronUp
} from 'lucide-react'

// ── Animated Counter ──────────────────────────────────────────
function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!inView) return
    const start = 0
    const step = end / (duration / 16)
    let current = start
    const timer = setInterval(() => {
      current += step
      if (current >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ── FAQ Accordion ─────────────────────────────────────────────
const faqs = [
  { q: 'How does AI verification work?', a: 'We use Google Gemini Vision AI to analyze your uploaded images. The AI detects the eco-friendly activity shown, assigns a confidence score, and awards points if confidence ≥ 70%.' },
  { q: 'What activities are accepted?', a: 'Tree planting, community cleanups, waste segregation, public transport use, cycling, reusable bottles/bags, and other eco actions. Upload a clear photo of your activity.' },
  { q: 'How are points calculated?', a: 'Each activity has base points (e.g., Tree Plantation = 100 pts). The AI verifies authenticity, and consistent daily uploads earn a streak bonus of +5 pts/day.' },
  { q: 'How do I redeem rewards?', a: 'Once you accumulate enough points, visit the Rewards page and click Redeem. Digital rewards (like certificates and gift cards) are processed within 48 hours.' },
  { q: 'Is my data private?', a: 'Your images are stored securely and only used for AI verification. Your profile name and points are public on the leaderboard. Email is never shared.' },
  { q: 'Can I submit the same photo twice?', a: 'No. Our AI uses perceptual hashing to detect duplicate or nearly identical images. Each submission must show a unique eco action.' },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <motion.div key={i} className="glass-card overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-5 text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-white font-medium">{faq.q}</span>
            {open === i ? <ChevronUp className="w-5 h-5 text-green-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />}
          </button>
          <motion.div
            initial={false}
            animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-white/50 text-sm leading-relaxed">{faq.a}</p>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

const challenges = [
  { type: 'Tree Plantation', points: 100, color: 'from-green-600 to-emerald-700' },
  { type: 'Community Cleanup', points: 80, color: 'from-blue-600 to-cyan-700' },
  { type: 'Cycling', points: 25, color: 'from-orange-500 to-yellow-600' },
  { type: 'Public Transport', points: 30, color: 'from-purple-600 to-violet-700' },
  { type: 'Waste Segregation', points: 20, color: 'from-teal-600 to-green-700' },
  { type: 'Reusable Bottle', points: 10, color: 'from-sky-500 to-blue-600' },
  { type: 'Cloth Bag', points: 10, color: 'from-amber-500 to-orange-600' },
  { type: 'Other Eco Action', points: 15, color: 'from-green-500 to-teal-600' },
]

const steps = [
  { num: 1, icon: Camera, title: 'Do an eco action', desc: 'Plant a tree, cycle to work, clean your neighborhood.' },
  { num: 2, icon: Leaf, title: 'Upload your proof', desc: 'Take a photo and upload it to EcoQuest.' },
  { num: 3, icon: Shield, title: 'AI verifies it', desc: 'Gemini Vision AI checks authenticity in seconds.' },
  { num: 4, icon: Zap, title: 'Earn points', desc: 'Points are instantly awarded to your account.' },
  { num: 5, icon: Trophy, title: 'Win rewards', desc: 'Climb leaderboards and unlock real rewards.' },
]

// Simulated monthly data for impact chart
const monthlyData = [
  { month: 'Jan', activities: 320 }, { month: 'Feb', activities: 580 },
  { month: 'Mar', activities: 790 }, { month: 'Apr', activities: 1100 },
  { month: 'May', activities: 1450 }, { month: 'Jun', activities: 1890 },
  { month: 'Jul', activities: 2340 }, { month: 'Aug', activities: 2890 },
]

export default function Landing() {
  const { user, signInWithGoogle } = useAuth()
  const [impact, setImpact] = useState<ImpactStats | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])

  useEffect(() => {
    apiClient.get('/impact').then(r => setImpact(r.data)).catch(() => {})
    apiClient.get('/rewards').then(r => setRewards(r.data.slice(0, 5))).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#050d05]">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050d05]" />

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 text-5xl animate-float opacity-60">🌳</div>
        <div className="absolute top-40 right-16 text-4xl animate-float-delayed opacity-50">🌿</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-float-slow opacity-40">♻️</div>
        <div className="absolute bottom-60 right-10 text-4xl animate-float opacity-50">🚴</div>
        <div className="absolute top-1/3 left-1/4 text-2xl animate-float-delayed opacity-30">🌱</div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-300 text-sm font-medium">India's #1 Sustainability Challenge Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 text-glow">
              Make India Greener,
              <br />
              <span className="gradient-text">One Action at a Time.</span>
            </h1>

            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload sustainable actions, earn points, climb leaderboards, and win rewards
              while helping India reduce its carbon footprint.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 animate-pulse-green">
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <button
                    id="hero-join-btn"
                    onClick={signInWithGoogle}
                    className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                  >
                    Join Challenge <ArrowRight className="w-5 h-5" />
                  </button>
                  <a href="#how-it-works" className="btn-outline text-lg px-8 py-4">
                    Learn More
                  </a>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section className="py-16 border-y border-green-500/10 bg-black/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '👥', label: 'Users Joined', value: impact?.total_users || 1247, suffix: '+' },
              { icon: '🌳', label: 'Trees Planted', value: impact?.trees_planted || 3211, suffix: '+' },
              { icon: '⚡', label: 'Actions Logged', value: impact?.total_activities || 8934, suffix: '+' },
              { icon: '💨', label: 'CO₂ Saved (kg)', value: impact ? Math.round(impact.total_carbon_saved) : 42180, suffix: 'kg' },
            ].map(({ icon, label, value, suffix }) => (
              <div key={label} className="text-center">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="text-white text-3xl md:text-4xl font-black">
                  <AnimatedCounter end={value} suffix="" />
                  <span className="text-green-400">{suffix}</span>
                </div>
                <p className="text-white/40 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">How It Works</h2>
          <p className="text-white/40">Five simple steps to start earning rewards for your eco actions</p>
        </div>
        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {steps.map(({ num, icon: Icon, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 z-10 relative">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{num}</div>
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/40 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Challenges ───────────────────────────────────────── */}
      <section className="py-24 bg-black/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">Eco Challenges</h2>
            <p className="text-white/40">Eight categories of verified eco-friendly actions</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {challenges.map(({ type, points, color }, i) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`glass-card-hover p-5 bg-gradient-to-br ${color} bg-opacity-10`}
              >
                <div className="text-3xl mb-3">{ACTIVITY_ICONS[type]}</div>
                <h3 className="text-white font-semibold text-sm">{type}</h3>
                <p className="text-green-400 font-bold mt-1">+{points} pts</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rewards Preview ───────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">Real Rewards</h2>
          <p className="text-white/40">Redeem your eco points for tangible benefits</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(rewards.length > 0 ? rewards : [
            { id: '1', title: 'Amazon Gift Card ₹200', points_req: 500, icon: '🛍️', description: 'Digital gift card', stock: 50, is_active: true },
            { id: '2', title: 'Eco Tote Bag', points_req: 300, icon: '👜', description: 'Reusable bag', stock: 100, is_active: true },
            { id: '3', title: 'Certificate', points_req: 100, icon: '📜', description: 'PDF certificate', stock: -1, is_active: true },
            { id: '4', title: 'Plant a Tree', points_req: 200, icon: '🌳', description: 'Via NGO partner', stock: 200, is_active: true },
            { id: '5', title: 'Champion Badge', points_req: 800, icon: '👑', description: 'Homepage feature', stock: 10, is_active: true },
          ]).map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-5 text-center"
            >
              <div className="text-4xl mb-3">{r.icon}</div>
              <h3 className="text-white font-semibold text-sm">{r.title}</h3>
              <p className="text-green-400 font-bold mt-2">{r.points_req} pts</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to={user ? '/rewards' : '/'} onClick={!user ? signInWithGoogle : undefined} className="btn-secondary inline-flex items-center gap-2">
            <Gift className="w-4 h-4" /> View All Rewards
          </Link>
        </div>
      </section>

      {/* ── Impact Chart ─────────────────────────────────────── */}
      <section className="py-24 bg-black/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">Growing Impact</h2>
            <p className="text-white/40">Monthly eco actions across India</p>
          </div>
          <div className="glass-card p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: '#0a0f0a', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', color: '#fff' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                />
                <Area type="monotone" dataKey="activities" stroke="#22c55e" strokeWidth={2} fill="url(#greenGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="py-24 max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <FAQ />
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-900/50 to-emerald-900/30 border border-green-500/20 p-12 text-center">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-green-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ready to make an impact?</h2>
            <p className="text-white/50 text-lg mb-8">Join 1,247+ Indians already earning rewards for going green</p>
            {user ? (
              <Link to="/upload" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
                Upload Your First Action <Leaf className="w-5 h-5" />
              </Link>
            ) : (
              <button
                id="cta-join-btn"
                onClick={signInWithGoogle}
                className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
              >
                Start for Free <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
