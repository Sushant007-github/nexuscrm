import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { StatusBadge, Modal, TableSkeleton, Pagination, EmptyState, Select } from '../../components/ui'
import { formatDate, avatarText, downloadCSV } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const TYPE_OPTS = [{ value: '', label: 'All Types' }, { value: 'contact', label: 'Contact' }, { value: 'patient', label: 'Patient' }, { value: 'student', label: 'Student' }, { value: 'customer', label: 'Customer' }]
const STATUS_OPTS = [{ value: '', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'inactive', label: 'Inactive' }, { value: 'closed', label: 'Closed' }]

function RecordForm({ record, onSave, onClose }) {
  const [form, setForm] = useState(record || { name: '', email: '', phone: '', type: 'contact', status: 'active', industry: 'core', tags: '' })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags }
      if (record?._id) {
        const { data } = await api.put(`/records/${record._id}`, payload)
        onSave(data)
        toast.success('Record updated')
      } else {
        const { data } = await api.post('/records', payload)
        onSave(data)
        toast.success('Record created')
      }
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving record')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Full Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="John Doe" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" placeholder="john@example.com" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input" placeholder="+1-555-0000" />
        </div>
        <div>
          <label className="label">Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} className="input">
            <option value="contact">Contact</option>
            <option value="patient">Patient</option>
            <option value="student">Student</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="label">Industry</label>
          <select value={form.industry} onChange={e => set('industry', e.target.value)} className="input">
            <option value="core">Core CRM</option>
            <option value="hospital">Hospital</option>
            <option value="school">School</option>
            <option value="restaurant">Restaurant</option>
          </select>
        </div>
        <div>
          <label className="label">Tags (comma-separated)</label>
          <input value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags} onChange={e => set('tags', e.target.value)} className="input" placeholder="VIP, Lead, Enterprise" />
        </div>
      </div>
      <div className="flex justify-end gap-3 p-6 pt-0">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : record?._id ? 'Update Record' : 'Create Record'}
        </button>
      </div>
    </form>
  )
}

export default function RecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [modal, setModal] = useState(null) // null | 'create' | record
  const [deleteId, setDeleteId] = useState(null)
  const navigate = useNavigate()

  const fetchRecords = async (p = page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p, limit: 15 })
      if (search) params.set('search', search)
      if (type) params.set('type', type)
      if (status) params.set('status', status)
      const { data } = await api.get(`/records?${params}`)
      setRecords(data.records)
      setPages(data.pages)
      setTotal(data.total)
    } catch (err) { toast.error('Failed to load records') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRecords(1) }, [type, status])
  useEffect(() => { const t = setTimeout(() => fetchRecords(1), 400); return () => clearTimeout(t) }, [search])
  useEffect(() => { fetchRecords(page) }, [page])

  const handleSave = (rec) => {
    setRecords(prev => {
      const idx = prev.findIndex(r => r._id === rec._id)
      if (idx >= 0) { const n = [...prev]; n[idx] = rec; return n }
      return [rec, ...prev]
    })
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/records/${deleteId}`)
      setRecords(prev => prev.filter(r => r._id !== deleteId))
      toast.success('Record deleted')
      setDeleteId(null)
    } catch (err) { toast.error(err.response?.data?.error || 'Error deleting') }
  }

  return (
    <div className="space-y-5 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">All Records</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} total records across all modules</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadCSV(records.map(r => ({ name: r.name, email: r.email, phone: r.phone, type: r.type, status: r.status, created: r.createdAt })), 'records-export')} className="btn-secondary">
            <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setModal('create')} className="btn-primary">
            <PlusIcon className="w-4 h-4" /> New Record
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email..." className="input pl-9" />
        </div>
        <div className="flex gap-2">
          <select value={type} onChange={e => setType(e.target.value)} className="input w-36">
            {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className="input w-36">
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tags</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8"><TableSkeleton rows={8} cols={6} /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={MagnifyingGlassIcon} title="No records found" description="Try adjusting your search or filters, or create a new record." action={<button onClick={() => setModal('create')} className="btn-primary">Create Record</button>} /></td></tr>
              ) : records.map((rec, i) => (
                <motion.tr
                  key={rec._id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="table-row"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                        {avatarText(rec.name)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{rec.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{rec.industry}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{rec.email || '—'}</div>
                    <div className="text-xs text-gray-400">{rec.phone || ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">{rec.type}</span>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={rec.status} /></td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(rec.tags || []).slice(0, 2).map(tag => (
                        <span key={tag} className="badge bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300">{tag}</span>
                      ))}
                      {rec.tags?.length > 2 && <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-500">+{rec.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="text-sm text-gray-500">{formatDate(rec.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/records/${rec._id}`)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-brand-600 transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setModal(rec)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(rec._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} total={total} onPage={p => { setPage(p); fetchRecords(p) }} />
      </div>

      {/* Create/Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Create New Record' : 'Edit Record'} size="lg">
        <RecordForm record={modal === 'create' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Record?" size="sm">
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone. The record and all associated data will be permanently deleted.</p>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white btn-primary shadow-none">Delete Record</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
