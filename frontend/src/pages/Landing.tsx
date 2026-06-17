import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../api/client'
import type { ImpactStats, Reward } from '../types'
import Footer from '../components/Footer'
import {
  Leaf, ArrowRight, Zap, Camera, Shield, Trophy, Gift,
  ChevronDown, ChevronUp, TreePine, Recycle, Bike,
  Bus, Droplets, ShoppingBag, Sparkles, Users, Wind,
  CreditCard, Award, Star, TrendingUp
} from 'lucide-react'

// ── Animated Counter ──────────────────────────────────────────────
function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!inView) return
    const step = end / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ── FAQ ───────────────────────────────────────────────────────────
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
        <div key={i} className="glass-card overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-container-low transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-on-surface font-medium">{faq.q}</span>
            {open === i
              ? <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
              : <ChevronDown className="w-5 h-5 text-on-surface-variant flex-shrink-0" />}
          </button>
          <motion.div
            initial={false}
            animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-on-surface-variant text-sm leading-relaxed">{faq.a}</p>
          </motion.div>
        </div>
      ))}
    </div>
  )
}

// ── Challenge data with Lucide icons, descriptions, accent colors ──
const challenges = [
  {
    type: 'Tree Plantation',
    points: 100,
    icon: TreePine,
    desc: 'Plant native trees & saplings',
    accent: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
  },
  {
    type: 'Community Cleanup',
    points: 80,
    icon: Sparkles,
    desc: 'Clean parks, beaches, streets',
    accent: 'bg-blue-500/10 text-blue-700 border-blue-200',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  },
  {
    type: 'Cycling',
    points: 25,
    icon: Bike,
    desc: 'Cycle instead of driving',
    accent: 'bg-orange-500/10 text-orange-700 border-orange-200',
    iconBg: 'bg-gradient-to-br from-orange-400 to-amber-500',
  },
  {
    type: 'Public Transport',
    points: 30,
    icon: Bus,
    desc: 'Use bus, metro, or train',
    accent: 'bg-purple-500/10 text-purple-700 border-purple-200',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
  },
  {
    type: 'Waste Segregation',
    points: 20,
    icon: Recycle,
    desc: 'Sort wet, dry & e-waste',
    accent: 'bg-teal-500/10 text-teal-700 border-teal-200',
    iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-600',
  },
  {
    type: 'Reusable Bottle',
    points: 10,
    icon: Droplets,
    desc: 'Ditch single-use plastics',
    accent: 'bg-sky-500/10 text-sky-700 border-sky-200',
    iconBg: 'bg-gradient-to-br from-sky-400 to-blue-500',
  },
  {
    type: 'Cloth Bag',
    points: 10,
    icon: ShoppingBag,
    desc: 'Carry reusable bags daily',
    accent: 'bg-rose-500/10 text-rose-700 border-rose-200',
    iconBg: 'bg-gradient-to-br from-rose-400 to-pink-500',
  },
  {
    type: 'Other Eco Action',
    points: 15,
    icon: Leaf,
    desc: 'Any verified green action',
    accent: 'bg-green-500/10 text-green-700 border-green-200',
    iconBg: 'bg-gradient-to-br from-green-500 to-primary',
  },
]

// ── Stats data with Lucide icons ──────────────────────────────────
const statItems = [
  { icon: Users,    label: 'Users Joined',    suffix: '+', key: 'total_users',         fallback: 1247,  iconBg: 'bg-primary/10 text-primary'     },
  { icon: TreePine, label: 'Trees Planted',   suffix: '+', key: 'trees_planted',       fallback: 3211,  iconBg: 'bg-emerald-500/10 text-emerald-700' },
  { icon: Zap,      label: 'Actions Logged',  suffix: '+', key: 'total_activities',    fallback: 8934,  iconBg: 'bg-amber-500/10 text-amber-600'  },
  { icon: Wind,     label: 'CO₂ Saved (kg)',  suffix: 'kg',key: 'total_carbon_saved',  fallback: 42180, iconBg: 'bg-sky-500/10 text-sky-600'      },
]

// ── Default rewards with Lucide icons ────────────────────────────
const defaultRewards = [
  { id: '1', Icon: CreditCard, title: 'Amazon Gift Card ₹200', points_req: 500, description: 'Digital gift card', iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500' },
  { id: '2', Icon: ShoppingBag, title: 'Eco Tote Bag',         points_req: 300, description: 'Reusable cotton bag', iconBg: 'bg-gradient-to-br from-teal-400 to-emerald-600' },
  { id: '3', Icon: Award,       title: 'Certificate',          points_req: 100, description: 'PDF eco certificate', iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-600' },
  { id: '4', Icon: TreePine,    title: 'Plant a Tree',         points_req: 200, description: 'Via NGO partner',     iconBg: 'bg-gradient-to-br from-green-500 to-emerald-700' },
  { id: '5', Icon: Star,        title: 'Champion Badge',       points_req: 800, description: 'Featured on homepage',iconBg: 'bg-gradient-to-br from-purple-500 to-violet-700' },
]

const steps = [
  { num: 1, icon: Camera,   title: 'Do an eco action',  desc: 'Plant a tree, cycle to work, clean your neighborhood.' },
  { num: 2, icon: Leaf,     title: 'Upload your proof', desc: 'Take a photo and upload it to EcoQuest.' },
  { num: 3, icon: Shield,   title: 'AI verifies it',    desc: 'Gemini Vision AI checks authenticity in seconds.' },
  { num: 4, icon: Zap,      title: 'Earn points',       desc: 'Points are instantly awarded to your account.' },
  { num: 5, icon: Trophy,   title: 'Win rewards',       desc: 'Climb leaderboards and unlock real rewards.' },
]

const monthlyData = [
  { month: 'Jan', activities: 320 }, { month: 'Feb', activities: 580 },
  { month: 'Mar', activities: 790 }, { month: 'Apr', activities: 1100 },
  { month: 'May', activities: 1450 }, { month: 'Jun', activities: 1890 },
  { month: 'Jul', activities: 2340 }, { month: 'Aug', activities: 2890 },
]

export default function Landing() {
  const { user, openAuthModal } = useAuth()
  const [impact, setImpact] = useState<ImpactStats | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])

  useEffect(() => {
    apiClient.get('/impact').then(r => setImpact(r.data)).catch(() => {})
    apiClient.get('/rewards').then(r => setRewards(r.data.slice(0, 5))).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-4 md:px-20 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-10 -z-10" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-container/40 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-secondary-container/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="z-10"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary text-sm font-medium">India's #1 Sustainability Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-on-background leading-tight mb-6 font-geist">
              Make India Greener,<br />
              <span className="gradient-text">One Action at a Time.</span>
            </h1>

            <p className="text-on-surface-variant text-lg max-w-lg mb-8 leading-relaxed">
              Upload sustainable actions, earn points, climb leaderboards, and win rewards.
              Join the movement for a sustainable tomorrow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link to="/dashboard" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 justify-center">
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <button
                    id="hero-join-btn"
                    onClick={openAuthModal}
                    className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 justify-center"
                  >
                    Join Challenge <ArrowRight className="w-5 h-5" />
                  </button>
                  <a href="#how-it-works" className="btn-outline text-base px-8 py-3.5 flex items-center justify-center">
                    Learn More
                  </a>
                </>
              )}
            </div>
          </motion.div>

          {/* Right — floating bento cards */}
          <div className="relative h-96 hidden lg:block">
            {/* Activity notification card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute top-8 right-8 w-64 glass-card p-4 animate-float"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                  <TreePine className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-on-surface font-semibold text-sm">Tree Planted</p>
                  <p className="text-on-surface-variant text-xs">AI verified · Just now</p>
                </div>
                <div className="ml-auto text-primary font-bold text-sm">+100</div>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '74%' }}
                  transition={{ delay: 0.8, duration: 1 }}
                />
              </div>
              <p className="text-on-surface-variant text-xs mt-1">740 / 1000 pts to Level 4</p>
            </motion.div>

            {/* User activity card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-16 left-0 glass-surface rounded-xl p-4 animate-float-delayed shadow-card w-64"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-outline-variant flex items-center justify-center flex-shrink-0">
                  <Recycle className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-on-surface font-semibold text-sm">Priya S.</p>
                  <p className="text-on-surface-variant text-xs mb-1.5">Zero Waste Day logged</p>
                  <div className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-xs font-bold">
                    <Zap className="w-3 h-3" /> +50 pts
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating icon — Bike */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-card"
            >
              <Bike className="w-6 h-6 text-white" />
            </motion.div>

            {/* Floating icon — TrendingUp */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              className="absolute top-12 left-1/3 w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center shadow-card"
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────── */}
      <section className="py-14 bg-surface-container-low border-y border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statItems.map(({ icon: Icon, label, suffix, key, fallback, iconBg }) => {
              const raw = impact ? (impact as any)[key] : fallback
              const value = key === 'total_carbon_saved' && impact
                ? Math.round(impact.total_carbon_saved)
                : (raw ?? fallback)
              return (
                <div key={label} className="text-center">
                  <div className={`w-12 h-12 rounded-xl ${iconBg} mx-auto mb-3 flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-on-background text-3xl md:text-4xl font-black font-geist">
                    <AnimatedCounter end={value} />
                    <span className="text-primary">{suffix}</span>
                  </div>
                  <p className="text-on-surface-variant text-sm mt-1">{label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">How It Works</h2>
          <p className="text-on-surface-variant">Five simple steps to start earning rewards for your eco actions</p>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
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
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-sm z-10 relative">
                    <Icon className="w-7 h-7 text-on-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container text-xs font-bold">{num}</div>
                </div>
                <h3 className="text-on-background font-semibold mb-2">{title}</h3>
                <p className="text-on-surface-variant text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Eco Challenges ────────────────────────────────────────── */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Eco Challenges</h2>
            <p className="text-on-surface-variant">Eight categories of AI-verified eco-friendly actions</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {challenges.map(({ type, points, icon: Icon, desc, accent, iconBg }, i) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 cursor-default overflow-hidden
                  hover:border-transparent hover:shadow-card-hover transition-all duration-300"
              >
                {/* Hover shimmer border */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, rgba(0,110,47,0.08) 0%, rgba(0,108,73,0.04) 100%)' }}
                />
                <div className="relative z-10">
                  {/* Icon container */}
                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-on-surface font-semibold text-sm leading-tight mb-1">{type}</h3>

                  {/* Description */}
                  <p className="text-on-surface-variant text-xs mb-3 leading-relaxed">{desc}</p>

                  {/* Points badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${accent}`}>
                    <Zap className="w-3 h-3" />
                    +{points} pts
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rewards Preview ───────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">Real Rewards</h2>
          <p className="text-on-surface-variant">Redeem your eco points for tangible benefits</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(rewards.length > 0
            ? rewards.map((r, i) => ({ ...defaultRewards[i % defaultRewards.length], title: r.title, points_req: r.points_req }))
            : defaultRewards
          ).map(({ id, Icon, title, points_req, description, iconBg }, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 text-center
                hover:border-transparent hover:shadow-card-hover transition-all duration-300 cursor-default overflow-hidden relative"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(0,110,47,0.05) 0%, transparent 100%)' }}
              />
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-on-surface font-semibold text-sm leading-tight">{title}</h3>
                <p className="text-on-surface-variant text-xs mt-1 mb-2">{description}</p>
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <Zap className="w-3 h-3" />{points_req} pts
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to={user ? '/rewards' : '/'}
            onClick={!user ? openAuthModal : undefined}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Gift className="w-4 h-4" /> View All Rewards
          </Link>
        </div>
      </section>

      {/* ── Impact Chart ──────────────────────────────────────────── */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Growing Impact</h2>
            <p className="text-on-surface-variant">Monthly eco actions logged across India</p>
          </div>
          <div className="glass-card p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#006e2f" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#006e2f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #bccbb9', borderRadius: '12px', color: '#0b1c30', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  labelStyle={{ color: '#3d4a3d' }}
                />
                <Area type="monotone" dataKey="activities" stroke="#006e2f" strokeWidth={2} fill="url(#greenGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-24 max-w-3xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <FAQ />
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-4 md:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-primary/15 p-12 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,110,47,0.06) 0%, rgba(0,108,73,0.03) 100%)' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-on-background mb-4 font-geist">Ready to make an impact?</h2>
            <p className="text-on-surface-variant text-lg mb-8">Join 1,247+ Indians already earning rewards for going green</p>
            {user ? (
              <Link to="/upload" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
                Upload Your First Action <Leaf className="w-5 h-5" />
              </Link>
            ) : (
              <button
                id="cta-join-btn"
                onClick={openAuthModal}
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
