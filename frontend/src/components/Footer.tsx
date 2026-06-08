import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-green-500/10 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">EcoQuest India</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Turn sustainable actions into real impact. Earn rewards while helping India reduce its carbon footprint.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-white/30 hover:text-green-400 transition-colors text-sm font-medium">Twitter</a>
              <a href="#" className="text-white/30 hover:text-green-400 transition-colors text-sm font-medium">Instagram</a>
              <a href="#" className="text-white/30 hover:text-green-400 transition-colors text-sm font-medium">GitHub</a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Platform</h3>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/dashboard', 'Dashboard'], ['/leaderboard', 'Leaderboard'], ['/rewards', 'Rewards']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-white/40 hover:text-green-400 text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Legal</h3>
            <ul className="space-y-2">
              {[['About', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#'], ['Contact', '#']].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-white/40 hover:text-green-400 text-sm transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-sm">© 2025 EcoQuest India. All rights reserved.</p>
          <p className="text-white/20 text-sm">
            Powered by <span className="text-green-400/60">Gemini AI</span> · Built with 🌱 for India
          </p>
        </div>
      </div>
    </footer>
  )
}
