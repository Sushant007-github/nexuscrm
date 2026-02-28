import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellIcon, SunIcon, MoonIcon, ChevronDownIcon,
  ArrowRightOnRectangleIcon, UserCircleIcon, Cog6ToothIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { avatarText, roleLabel, roleColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/records': 'Records',
  '/billing': 'Billing & Invoices',
  '/analytics': 'Analytics',
  '/attendance': 'Attendance',
  '/users': 'User Management',
  '/settings': 'Settings',
  '/audit': 'Audit Log',
  '/modules/hospital': 'Hospital Module',
  '/modules/school': 'School Module',
  '/modules/restaurant': 'Restaurant Module',
}

export default function TopBar({ collapsed }) {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const title = pageTitles[location.pathname] || 'NexusCRM'
  const sidebarW = collapsed ? 72 : 260

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header
      className="fixed top-0 right-0 z-20 h-16 flex items-center px-6 gap-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-700/60 transition-all duration-300"
      style={{ left: sidebarW, transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)' }}
    >
      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-lg font-display font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 w-56">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
        <input placeholder="Search..." className="bg-transparent text-sm outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 w-full" />
        <kbd className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </div>

      {/* Theme toggle */}
      <button onClick={toggle} className="btn-ghost p-2">
        {isDark ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-gray-500" />}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button onClick={() => setNotifOpen(o => !o)} className="btn-ghost p-2 relative">
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
        </button>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 card shadow-soft-lg z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className="font-semibold text-sm">Notifications</span>
                <span className="badge bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300">3 new</span>
              </div>
              {[
                { title: 'Invoice overdue', desc: 'INV-00004 is 15 days overdue', time: '2h ago', dot: 'bg-red-500' },
                { title: 'New record added', desc: 'Marcus Reynolds was added', time: '5h ago', dot: 'bg-brand-500' },
                { title: 'Payment received', desc: '$4,770 received from Acme Corp', time: '1d ago', dot: 'bg-emerald-500' },
              ].map((n, i) => (
                <div key={i} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-b border-gray-50 dark:border-gray-700/30 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{n.desc}</div>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">{n.time}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile dropdown */}
      <div className="relative">
        <button
          onClick={() => setProfileOpen(o => !o)}
          className="flex items-center gap-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
            {avatarText(user?.name)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-none">{user?.name?.split(' ')[0]}</div>
            <div className={`text-[10px] mt-0.5 badge px-1.5 py-0 ${roleColor(user?.role)}`}>{roleLabel(user?.role)}</div>
          </div>
          <ChevronDownIcon className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-14 w-52 card shadow-soft-lg z-50 py-1"
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="font-semibold text-sm text-gray-900 dark:text-white">{user?.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">{user?.email}</div>
              </div>
              <button onClick={() => { navigate('/settings'); setProfileOpen(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <Cog6ToothIcon className="w-4 h-4" /> Settings
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
