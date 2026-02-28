import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import {
  CurrencyDollarIcon, UsersIcon, Squares2X2Icon, ArrowTrendingUpIcon,
  ClockIcon, CheckCircleIcon, ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { KPICard } from '../../components/ui'
import { formatCurrency, formatRelative, avatarText } from '../../utils/helpers'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

const COLORS = ['#1082eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-soft-lg">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {p.name === 'revenue' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/dashboard/summary').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const kpis = data?.kpis || {}
  const monthly = data?.charts?.monthly || []
  const invoiceStatus = data?.charts?.invoiceStatus || []
  const activity = data?.recentActivity || []

  const actionColor = (action) => ({
    CREATE: 'bg-emerald-500', UPDATE: 'bg-blue-500', DELETE: 'bg-red-500',
    LOGIN: 'bg-purple-500', LOGOUT: 'bg-gray-400'
  }[action] || 'bg-gray-400')

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Welcome bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Here's what's happening across your organization today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 shadow-soft">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-soft" />
          All systems operational
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: kpis.totalRevenue, prefix: '$', change: kpis.revenueGrowth, changeLabel: 'vs last month', icon: CurrencyDollarIcon, color: 'brand' },
          { title: 'This Month', value: kpis.monthRevenue, prefix: '$', icon: ArrowTrendingUpIcon, color: 'emerald' },
          { title: 'Total Records', value: kpis.totalRecords, change: kpis.recordGrowth, changeLabel: 'vs last month', icon: Squares2X2Icon, color: 'violet' },
          { title: 'Active Users', value: kpis.totalUsers, icon: UsersIcon, color: 'teal' },
        ].map((kpi, i) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <KPICard {...kpi} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue area chart */}
        <motion.div className="card p-6 lg:col-span-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-gray-900 dark:text-white">Revenue Trend</h3>
              <p className="text-sm text-gray-500 mt-0.5">Monthly revenue over last 6 months</p>
            </div>
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-brand-500 rounded inline-block" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-emerald-500 rounded inline-block" /> Records</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1082eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1082eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30 dark:opacity-10" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#1082eb" strokeWidth={2.5} fill="url(#revGrad)" name="revenue" dot={{ r: 4, fill: '#1082eb', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="records" stroke="#10b981" strokeWidth={2} fill="url(#recGrad)" name="records" dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Invoice status pie */}
        <motion.div className="card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-1">Invoice Status</h3>
          <p className="text-sm text-gray-500 mb-6">Distribution by payment status</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={invoiceStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="count" nameKey="_id" paddingAngle={3}>
                {invoiceStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {invoiceStatus.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{item._id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
                  <span className="text-gray-400 text-xs">{formatCurrency(item.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Records bar chart */}
        <motion.div className="card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-1">Record Growth</h3>
          <p className="text-sm text-gray-500 mb-6">New records added per month</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30 dark:opacity-10" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="records" fill="#1082eb" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent activity */}
        <motion.div className="card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-gray-900 dark:text-white">Recent Activity</h3>
              <p className="text-sm text-gray-500">Latest system events</p>
            </div>
            <ClockIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-3/4" />
                    <div className="skeleton h-2.5 w-1/2" />
                  </div>
                </div>
              ))
            ) : activity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
            ) : activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full ${actionColor(a.action)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {a.userEmail ? a.userEmail[0].toUpperCase() : '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium">{a.userEmail}</span>
                    <span className="text-gray-500"> · {a.action} on </span>
                    <span className="font-medium">{a.resource}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelative(a.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
