export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount || 0)

export const formatDate = (date, opts = {}) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', ...opts }).format(new Date(date))
}

export const formatRelative = (date) => {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  return formatDate(date)
}

export const statusClass = (status) => {
  const map = { active: 'pill-status-active', inactive: 'pill-status-inactive', pending: 'pill-status-pending', paid: 'pill-status-paid', overdue: 'pill-status-overdue', sent: 'pill-status-sent', draft: 'pill-status-draft', partial: 'pill-status-pending' }
  return map[status] || 'pill-status-inactive'
}

export const roleColor = (role) => {
  const map = { super_admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', admin: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', manager: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300', staff: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' }
  return map[role] || 'bg-gray-100 text-gray-700'
}

export const roleLabel = (role) => ({ super_admin: 'Super Admin', admin: 'Admin', manager: 'Manager', staff: 'Staff' }[role] || role)

export const avatarText = (name = '') => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

export const downloadCSV = (data, filename) => {
  const headers = Object.keys(data[0] || {})
  const rows = [headers.join(','), ...data.map(r => headers.map(h => JSON.stringify(r[h] || '')).join(','))]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click()
  URL.revokeObjectURL(url)
}
