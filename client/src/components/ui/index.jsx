import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

// Animated counter hook
export function useCounter(target, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let startTime = null
    const startValue = 0
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(startValue + (target - startValue) * ease))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target, duration])
  return value
}

// KPI Card with animated counter
export function KPICard({ title, value, prefix = '', suffix = '', change, changeLabel, icon: Icon, color = 'brand', loading }) {
  const num = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0
  const animated = useCounter(num)

  const colors = {
    brand: 'from-brand-500 to-brand-700',
    emerald: 'from-emerald-500 to-emerald-700',
    violet: 'from-violet-500 to-violet-700',
    amber: 'from-amber-500 to-amber-700',
    rose: 'from-rose-500 to-rose-700',
    teal: 'from-teal-500 to-teal-700',
  }

  if (loading) return (
    <div className="stat-card">
      <div className="flex justify-between">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton w-10 h-10 rounded-xl" />
      </div>
      <div className="skeleton h-8 w-32 mt-1" />
      <div className="skeleton h-3 w-20" />
    </div>
  )

  return (
    <motion.div className="stat-card group" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg flex-shrink-0`}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">{prefix}</span>}
        <span className="text-3xl font-display font-bold text-gray-900 dark:text-white">
          {animated.toLocaleString()}
        </span>
        {suffix && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{suffix}</span>}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-semibold ${parseFloat(change) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {parseFloat(change) >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          {changeLabel && <span className="text-xs text-gray-400">{changeLabel}</span>}
        </div>
      )}
    </motion.div>
  )
}

// Status badge
export function StatusBadge({ status }) {
  const labels = { active: 'Active', inactive: 'Inactive', pending: 'Pending', paid: 'Paid', overdue: 'Overdue', sent: 'Sent', draft: 'Draft', partial: 'Partial', closed: 'Closed', completed: 'Completed', cancelled: 'Cancelled' }
  const cls = {
    active: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    pending: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    paid: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    overdue: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    sent: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    draft: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    partial: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    closed: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    completed: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    cancelled: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  }
  return <span className={`badge ${cls[status] || cls.inactive}`}>{labels[status] || status}</span>
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        {Icon && <Icon className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// Modal
export function Modal({ open, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={`relative w-full ${sizes[size]} card shadow-soft-lg max-h-[90vh] overflow-y-auto`}
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white">{title}</h2>
                <button onClick={onClose} className="btn-ghost p-1.5 text-gray-400">✕</button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className={`skeleton h-4 rounded-lg flex-1 ${j === 0 ? 'max-w-[40px]' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

// Pagination
export function Pagination({ page, pages, total, onPage }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
      <span className="text-sm text-gray-500">Page {page} of {pages} · {total} total</span>
      <div className="flex gap-1">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="btn-secondary py-1.5 px-3 disabled:opacity-40">← Prev</button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onPage(p)} className={`py-1.5 px-3 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-brand-600 text-white shadow-brand' : 'btn-secondary'}`}>{p}</button>
        ))}
        <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="btn-secondary py-1.5 px-3 disabled:opacity-40">Next →</button>
      </div>
    </div>
  )
}

// Select
export function Select({ label, value, onChange, options, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
      className="input appearance-none pr-8">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

