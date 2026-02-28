import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  BellIcon, SunIcon, MoonIcon, ChevronDownIcon,
  ArrowRightOnRectangleIcon, Cog6ToothIcon,
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

  const title = pageTitles[location.pathname] || 'NexusCRM'
  const sidebarW = collapsed ? 72 : 260

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header
      className="fixed top-0 right-0 z-20 h-16 flex items-center px-6 gap-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-700/60"
      style={{ left: sidebarW, transition: 'left 0.25s ease' }}
    >
      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-lg font-display font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Theme toggle */}
      <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        {isDark ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-gray-500" />}
      </button>

      {/* Profile dropdown */}
      <div className="relative">
        <button
          onClick={() => setProfileOpen(o => !o)}
          className="flex items-center gap-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
            {avatarText(user?.name)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-none">{user?.name?.split(' ')[0]}</div>
          </div>
          <ChevronDownIcon className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-14 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 py-1">
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
          </div>
        )}
      </div>
    </header>
  )
}

