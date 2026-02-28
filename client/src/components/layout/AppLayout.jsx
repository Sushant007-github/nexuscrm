import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  // Auto-collapse on small screens
  useEffect(() => {
    const check = () => setCollapsed(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const sidebarW = collapsed ? 72 : 260

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1623]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <TopBar collapsed={collapsed} />
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarW }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
