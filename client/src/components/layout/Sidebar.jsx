import { NavLink } from 'react-router-dom'
import {
  HomeIcon, UsersIcon, DocumentTextIcon, CurrencyDollarIcon,
  ChartBarIcon, CalendarIcon, Cog6ToothIcon, ShieldCheckIcon,
  ChevronLeftIcon, ChevronRightIcon, HeartIcon, AcademicCapIcon,
  BuildingStorefrontIcon, Squares2X2Icon, BeakerIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { avatarText } from '../../utils/helpers'

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
      { to: '/records', icon: Squares2X2Icon, label: 'Records' },
      { to: '/billing', icon: CurrencyDollarIcon, label: 'Billing' },
      { to: '/analytics', icon: ChartBarIcon, label: 'Analytics' },
      { to: '/attendance', icon: CalendarIcon, label: 'Attendance' },
    ]
  },
  {
    label: 'Modules',
    items: [
      { to: '/modules/hospital', icon: HeartIcon, label: 'Hospital', color: 'text-red-300' },
      { to: '/modules/school', icon: AcademicCapIcon, label: 'School', color: 'text-yellow-300' },
      { to: '/modules/restaurant', icon: BuildingStorefrontIcon, label: 'Restaurant', color: 'text-orange-300' },
    ]
  },
  {
    label: 'Admin',
    items: [
      { to: '/users', icon: UsersIcon, label: 'Users', roles: ['super_admin', 'admin'] },
      { to: '/audit', icon: ShieldCheckIcon, label: 'Audit Log', roles: ['super_admin', 'admin'] },
      { to: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
    ]
  }
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, hasRole } = useAuth()

  return (
    <aside
      style={{
        width: collapsed ? 56 : 260,,
        background: 'linear-gradient(180deg, #091f40 0%, #0550a3 60%, #0565c9 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.25s ease'
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 min-h-[64px]">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
              <BeakerIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-display text-lg font-bold tracking-tight leading-none">Nexus</span>
              <span className="text-blue-300 font-display text-lg font-bold tracking-tight leading-none">CRM</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mx-auto">
            <BeakerIcon className="w-5 h-5 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg text-blue-200/60 hover:text-white hover:bg-white/10 transition-colors ml-2"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-6">
        {navGroups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-blue-200/40">{group.label}</div>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                if (item.roles && !hasRole(...item.roles)) return null
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white/20 text-white shadow-lg'
                          : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${item.color || ''}`} />
                    {!collapsed && (
                      <span className="whitespace-nowrap text-sm font-medium">{item.label}</span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-300 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg">
            {avatarText(user?.name)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-blue-200/60 truncate">{user?.email}</div>
            </div>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mt-2 w-full flex justify-center p-1.5 rounded-lg text-blue-200/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
