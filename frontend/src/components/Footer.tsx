import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full py-10 bg-surface-container-low border-t border-outline-variant/40">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-on-primary" />
              </div>
              <span className="font-bold text-primary text-lg font-geist">EcoQuest India</span>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
              Turn sustainable actions into real impact. Earn rewards while helping India reduce its carbon footprint.
            </p>
            <div className="flex gap-4 mt-1">
              {['Twitter', 'Instagram', 'GitHub'].map(s => (
                <a key={s} href="/" className="text-on-surface-variant hover:text-primary transition-colors text-sm">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest mb-4">Platform</h3>
            <ul className="space-y-2.5">
              {[['/', 'Home'], ['/dashboard', 'Dashboard'], ['/leaderboard', 'Leaderboard'], ['/rewards', 'Rewards']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-on-surface-variant hover:text-primary text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {[['About', '/'], ['Privacy Policy', '/'], ['Terms of Service', '/'], ['Contact', '/']].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-on-surface-variant hover:text-primary text-sm transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-outline-variant/40 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-on-surface-variant text-sm">© 2025 EcoQuest India. All rights reserved.</p>
          <p className="text-on-surface-variant text-sm">
            Powered by <span className="text-primary">Gemini AI</span> · Built with 🌱 for India
          </p>
        </div>
      </div>
    </footer>
  )
}
