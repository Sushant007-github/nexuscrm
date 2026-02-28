import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(true)
  const location = useLocation()

  // Always collapse on mobile
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Collapse sidebar on navigation on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true)
    }
  }, [location.pathname])

  const sidebarW = collapsed ? 56 : 260

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1623]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <TopBar collapsed={collapsed} />
      <main
        className="pt-16 min-h-screen"
        style={{ marginLeft: sidebarW, transition: 'margin-left 0.25s ease' }}
      >
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
