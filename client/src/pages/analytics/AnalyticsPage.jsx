import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend } from 'recharts'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { formatCurrency, downloadCSV } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const COLORS = ['#1082eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState([])
  const [overview, setOverview] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/revenue'),
      api.get('/analytics/overview')
    ]).then(([r, o]) => {
      setRevenue(r.data)
      setOverview(o.data)
    }).catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const Chart = ({ title, subtitle, children }) => (
    <motion.div className="card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="font-display font-bold text-gray-900 dark:text-white">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5 mb-5">{subtitle}</p>}
      {children}
    </motion.div>
  )

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-5 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
          <p className="text-sm text-gray-500">12-month performance overview</p>
        </div>
        <button onClick={() => downloadCSV(revenue, 'revenue-report')} className="btn-secondary">
          <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Revenue trend */}
      <Chart title="Revenue Over Time" subtitle="Monthly revenue for the past 12 months">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenue} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1082eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1082eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30 dark:opacity-10" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v, n) => [n === 'revenue' ? formatCurrency(v) : v, n]} />
            <Area type="monotone" dataKey="revenue" stroke="#1082eb" strokeWidth={2.5} fill="url(#revenueGrad)" name="revenue" dot={{ r: 4, fill: '#1082eb', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Chart>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Invoice count bar */}
        <div className="lg:col-span-2">
          <Chart title="Invoice Volume" subtitle="Monthly invoice count">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenue} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30 dark:opacity-10" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="invoices" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={28} name="Invoices" />
              </BarChart>
            </ResponsiveContainer>
          </Chart>
        </div>

        {/* Records by type pie */}
        <Chart title="Records by Type" subtitle="Distribution across categories">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={overview.byType || []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="_id" paddingAngle={3}>
                {(overview.byType || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {(overview.byType || []).map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-gray-600 dark:text-gray-400 capitalize">{item._id} ({item.count})</span>
              </div>
            ))}
          </div>
        </Chart>
      </div>

      {/* Status and industry charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Chart title="Status Distribution" subtitle="Records by current status">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={overview.byStatus || []} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="_id" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip />
              <Bar dataKey="count" fill="#1082eb" radius={[0, 5, 5, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        <Chart title="Industry Breakdown" subtitle="Records by industry module">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={overview.byIndustry || []} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30 dark:opacity-10" />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[5, 5, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>
      </div>

      {/* Top users */}
      {(overview.topUsers || []).length > 0 && (
        <Chart title="Top Performers" subtitle="Users with most assigned records">
          <div className="space-y-3">
            {overview.topUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.user?.name?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{u.user?.name || 'Unknown'}</span>
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{u.count} records</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(u.count / (overview.topUsers[0]?.count || 1)) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Chart>
      )}
    </div>
  )
}

