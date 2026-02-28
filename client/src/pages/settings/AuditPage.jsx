import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Pagination, EmptyState } from '../../components/ui'
import { formatRelative, avatarText } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const ACTION_STYLES = {
  CREATE: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  UPDATE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  DELETE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  LOGIN: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  LOGOUT: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  REGISTER: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
}

export default function AuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [action, setAction] = useState('')
  const [resource, setResource] = useState('')

  const fetch = async (p = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p, limit: 25 })
      if (action) params.set('action', action)
      if (resource) params.set('resource', resource)
      const { data } = await api.get(`/audit?${params}`)
      setLogs(data.logs)
      setPages(data.pages)
      setTotal(data.total)
    } catch { toast.error('Failed to load audit logs') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch(1) }, [action, resource])

  return (
    <div className="space-y-5 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Audit Log</h2>
          <p className="text-sm text-gray-500">{total} logged events in your organization</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex gap-3">
        <select value={action} onChange={e => setAction(e.target.value)} className="input w-40">
          <option value="">All Actions</option>
          {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'REGISTER'].map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select value={resource} onChange={e => setResource(e.target.value)} className="input w-40">
          <option value="">All Resources</option>
          {['auth', 'records', 'invoices', 'users', 'attendance'].map(r => (
            <option key={r} value={r} className="capitalize">{r}</option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">IP Address</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon={ShieldCheckIcon} title="No audit logs" description="Events will appear here as users interact with the system." /></td></tr>
              ) : logs.map((log, i) => (
                <motion.tr
                  key={log._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="table-row"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {log.userEmail?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{log.userEmail || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`badge text-xs font-bold ${ACTION_STYLES[log.action] || 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{log.resource}</span>
                    {log.resourceId && (
                      <span className="text-xs text-gray-400 font-mono ml-2">#{log.resourceId?.slice(-6)}</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 hidden lg:table-cell">
                    <span className="text-xs font-mono text-gray-400">{log.ipAddress || '—'}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-gray-500">{formatRelative(log.timestamp)}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} total={total} onPage={p => { setPage(p); fetch(p) }} />
      </div>
    </div>
  )
}
