import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, BeakerIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@crm.com', role: 'Full access' },
  { label: 'Manager', email: 'manager@crm.com', role: 'Team lead' },
  { label: 'Staff', email: 'staff@crm.com', role: 'Limited access' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('admin@crm.com')
  const [password, setPassword] = useState('password123')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  if (params.get('expired')) toast.error('Session expired. Please sign in again.')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex dark:bg-[#0a1220]" style={{ background: 'linear-gradient(135deg, #0a1220 0%, #0d2240 50%, #0a1a35 100%)' }}>
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-[45%] relative overflow-hidden">
        {/* BG decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3aa0f8 0%, transparent 70%)' }} />
          <div className="absolute bottom-20 right-0 w-80 h-80 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #1082eb 0%, transparent 70%)' }} />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 relative z-10"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-brand-lg">
            <BeakerIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-white font-display text-2xl font-bold">Nexus</span>
            <span className="text-brand-400 font-display text-2xl font-bold">CRM</span>
          </div>
        </motion.div>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <h2 className="text-5xl font-display font-bold text-white leading-tight mb-4">
            Enterprise Intelligence<br />
            <span className="text-brand-400">at Scale</span>
          </h2>
          <p className="text-blue-200/60 text-lg mb-10 leading-relaxed">
            A modular CRM platform built for hospitals, schools, and restaurants. Manage everything from a single, beautiful interface.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['Multi-industry', 'Role-based access', 'Real-time analytics', 'Invoice management', 'Audit logging'].map(f => (
              <span key={f} className="bg-white/10 text-blue-200 text-sm px-4 py-1.5 rounded-full border border-white/10">
                ✓ {f}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Bottom testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 border border-white/10 rounded-2xl p-5 bg-white/5 backdrop-blur-sm"
        >
          <p className="text-blue-100/80 italic text-sm leading-relaxed mb-3">
            "NexusCRM transformed how our hospital manages patients. The reporting alone saved us 20+ hours weekly."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">DR</div>
            <div>
              <div className="text-white text-sm font-medium">Dr. Ravi Patel</div>
              <div className="text-blue-300/60 text-xs">CMO, Metro General Hospital</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand">
              <BeakerIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-display text-xl font-bold">NexusCRM</span>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-2xl font-display font-bold text-white mb-1">Welcome back</h1>
              <p className="text-blue-200/60 text-sm">Sign in to your workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-blue-200/60 uppercase tracking-wider mb-1.5">Email address</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-blue-300/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-blue-200/30 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-all"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-200/60 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-blue-300/40" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-blue-200/30 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-all"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-200/40 hover:text-blue-200 transition-colors">
                    {showPass ? <EyeSlashIcon className="w-4.5 h-4.5" /> : <EyeIcon className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-brand-lg hover:shadow-brand-lg flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                ) : 'Sign in to workspace →'}
              </motion.button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-blue-200/40 uppercase tracking-wider font-semibold mb-3">Demo accounts (password: password123)</p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map(a => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => { setEmail(a.email); setPassword('password123') }}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2.5 text-left transition-all group"
                  >
                    <div className="text-xs font-semibold text-white group-hover:text-brand-300 transition-colors">{a.label}</div>
                    <div className="text-[10px] text-blue-200/40 mt-0.5">{a.role}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
