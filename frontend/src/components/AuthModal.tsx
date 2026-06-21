import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { X, Leaf, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

type Tab = 'signin' | 'signup'

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('signin')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // Refs for autofocus
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setEmail(''); setPassword(''); setName(''); setError(''); setShowPassword(false)
  }

  const switchTab = (t: Tab) => { setTab(t); reset() }

  // Autofocus the first input on modal open or tab change
  useEffect(() => {
    if (!authModalOpen) return
    const timer = setTimeout(() => {
      if (tab === 'signup') {
        nameRef.current?.focus()
      } else {
        emailRef.current?.focus()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [authModalOpen, tab])

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (e: any) {
      toast.error(e.message || 'Google sign-in failed')
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'signin') {
        await signInWithEmail(email, password)
        toast.success('Welcome back! 🌿')
        closeAuthModal()
        navigate('/dashboard')
      } else {
        if (name.trim().length < 2) {
          setError('Please enter your full name (at least 2 characters)')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }
        await signUpWithEmail(email, password, name)
        toast.success('Account created! Check your email to confirm, then sign in. 🌱', { duration: 5000 })
        switchTab('signin')
      }
    } catch (e: any) {
      const msg = e.message || 'Something went wrong'
      setError(
        msg.includes('Invalid login') ? 'Incorrect email or password' :
        msg.includes('already registered') ? 'This email is already registered. Try signing in.' :
        msg.includes('Email not confirmed') ? 'Please confirm your email first, then sign in.' :
        msg
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {authModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div
              className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
            >

              {/* Header */}
              <div className="relative p-6 pb-0">
                <button
                  onClick={closeAuthModal}
                  aria-label="Close"
                  className="absolute top-4 right-4 p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                    <Leaf className="w-5 h-5 text-on-primary" />
                  </div>
                  <span id="auth-modal-title" className="font-bold text-on-background text-xl">
                    Eco<span className="text-primary">Quest</span>
                  </span>
                </div>

                {/* Tab switcher */}
                <div className="flex bg-surface-container rounded-xl p-1 mb-6" role="tablist">
                  {(['signin', 'signup'] as Tab[]).map(t => (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={tab === t}
                      onClick={() => switchTab(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        tab === t
                          ? 'bg-surface-container-highest text-on-surface shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {t === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="px-6 pb-6 space-y-4">

                {/* Google Button */}
                <button
                  onClick={handleGoogle}
                  disabled={googleLoading || loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-outline-variant bg-surface-container hover:bg-surface-container-high hover:border-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium text-on-surface text-sm"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {tab === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-outline-variant" />
                  <span className="text-xs text-on-surface-variant font-medium">or use email</span>
                  <div className="flex-1 h-px bg-outline-variant" />
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {tab === 'signup' && (
                    <div className="relative">
                      <label htmlFor="auth-name" className="sr-only">Full name</label>
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                      <input
                        ref={nameRef}
                        id="auth-name"
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface placeholder:text-on-surface-variant/60 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <label htmlFor="auth-email" className="sr-only">Email address</label>
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input
                      ref={emailRef}
                      id="auth-email"
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface placeholder:text-on-surface-variant/60 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <label htmlFor="auth-password" className="sr-only">Password</label>
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface placeholder:text-on-surface-variant/60 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-error text-xs px-1"
                      role="alert"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Info for signup */}
                  {tab === 'signup' && (
                    <p className="text-xs text-on-surface-variant px-1">
                      📧 You'll receive a confirmation email. Click the link to activate your account, then sign in.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {tab === 'signin' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Switch tab link */}
                <p className="text-center text-xs text-on-surface-variant">
                  {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => switchTab(tab === 'signin' ? 'signup' : 'signin')}
                    className="text-primary font-semibold hover:underline"
                  >
                    {tab === 'signin' ? 'Sign up free' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
