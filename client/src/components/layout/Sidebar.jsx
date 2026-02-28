import { useNavigate, useLocation } from 'react-router-dom'
import {
  HomeIcon, UsersIcon, CurrencyDollarIcon,
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
  const navigate = useNavigate()
  const location = useLocation()

  const goTo = (path) => {
    navigate(path)
  }

  return (
    <aside
      style={{
        width: collapsed ? 72 : 260,
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px', minHeight: 64 }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BeakerIcon style={{ width: 20, height: 20, color: 'white' }} />
            </div>
            <div>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>Nexus</span>
              <span style={{ color: '#93c5fd', fontWeight: 700, fontSize: 18 }}>CRM</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ width: 32, height: 32, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <BeakerIcon style={{ width: 20, height: 20, color: 'white' }} />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(147,197,253,0.6)' }}
          >
            <ChevronLeftIcon style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {navGroups.map(group => (
          <div key={group.label} style={{ marginBottom: 24 }}>
            {!collapsed && (
              <div style={{ padding: '0 12px', marginBottom: 8, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(147,197,253,0.4)' }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => {
              if (item.roles && !hasRole(...item.roles)) return null
              const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
              return (
                <div
                  key={item.to}
                  onClick={() => goTo(item.to)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 12,
                    marginBottom: 2,
                    cursor: 'pointer',
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                    color: isActive ? 'white' : 'rgba(191,219,254,0.7)',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    userSelect: 'none',
                  }}
                >
                  <item.icon style={{ width: 20, height: 20, flexShrink: 0, color: item.color ? undefined : 'inherit' }} />
                  {!collapsed && (
                    <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>{item.label}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px', borderRadius: 12, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: 32, height: 32, borderRadius: 12, background: 'linear-gradient(135deg, #93c5fd, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {avatarText(user?.name)}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(147,197,253,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{ marginTop: 8, width: '100%', display: 'flex', justifyContent: 'center', padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(147,197,253,0.6)' }}
          >
            <ChevronRightIcon style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>
    </aside>
  )
}
