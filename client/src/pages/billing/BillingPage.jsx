import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { StatusBadge, Modal, TableSkeleton, Pagination, EmptyState, KPICard } from '../../components/ui'
import { formatCurrency, formatDate, avatarText } from '../../utils/helpers'
import { CurrencyDollarIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import api from '../../utils/api'
import toast from 'react-hot-toast'

function LineItemEditor({ items, onChange }) {
  const add = () => onChange([...items, { description: '', quantity: 1, unitPrice: 0, taxRate: 10, discount: 0 }])
  const update = (i, k, v) => {
    const n = [...items]; n[i] = { ...n[i], [k]: v }; onChange(n)
  }
  const remove = (i) => onChange(items.filter((_, j) => j !== i))

  return (
    <div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input value={item.description} onChange={e => update(i, 'description', e.target.value)} placeholder="Description" className="input col-span-4 text-xs" />
            <input type="number" value={item.quantity} onChange={e => update(i, 'quantity', +e.target.value)} className="input col-span-1 text-xs" min={0} />
            <input type="number" value={item.unitPrice} onChange={e => update(i, 'unitPrice', +e.target.value)} placeholder="Price" className="input col-span-2 text-xs" min={0} />
            <input type="number" value={item.taxRate} onChange={e => update(i, 'taxRate', +e.target.value)} placeholder="Tax%" className="input col-span-2 text-xs" min={0} />
            <input type="number" value={item.discount} onChange={e => update(i, 'discount', +e.target.value)} placeholder="Disc%" className="input col-span-2 text-xs" min={0} />
            <button type="button" onClick={() => remove(i)} className="col-span-1 text-red-400 hover:text-red-600 text-center">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium">+ Add line item</button>
    </div>
  )
}

function InvoiceForm({ invoice, onSave, onClose }) {
  const [form, setForm] = useState(invoice || {
    customerName: '', customerEmail: '', status: 'draft',
    lineItems: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 10, discount: 0 }],
    notes: '', discountAmount: 0
  })
  const [saving, setSaving] = useState(false)

  const subtotal = form.lineItems.reduce((s, item) => s + item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100), 0)
  const tax = form.lineItems.reduce((s, item) => s + item.quantity * item.unitPrice * (item.taxRate || 0) / 100, 0)
  const total = subtotal + tax - (form.discountAmount || 0)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (invoice?._id) {
        const { data } = await api.put(`/invoices/${invoice._id}`, form)
        onSave(data); toast.success('Invoice updated')
      } else {
        const { data } = await api.post('/invoices', form)
        onSave(data); toast.success('Invoice created')
      }
      onClose()
    } catch (err) { toast.error(err.response?.data?.error || 'Error') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Customer Name *</label><input required value={form.customerName} onChange={e => set('customerName', e.target.value)} className="input" /></div>
          <div><label className="label">Customer Email</label><input type="email" value={form.customerEmail} onChange={e => set('customerEmail', e.target.value)} className="input" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
              {['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
          <div><label className="label">Due Date</label><input type="date" value={form.dueDate?.slice(0, 10) || ''} onChange={e => set('dueDate', e.target.value)} className="input" /></div>
        </div>

        <div>
          <label className="label">Line Items</label>
          <div className="grid grid-cols-12 gap-2 mb-1 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            <span className="col-span-4">Description</span>
            <span className="col-span-1">Qty</span>
            <span className="col-span-2">Price</span>
            <span className="col-span-2">Tax%</span>
            <span className="col-span-2">Disc%</span>
          </div>
          <LineItemEditor items={form.lineItems} onChange={v => set('lineItems', v)} />
        </div>

        {/* Totals */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-gray-500 mt-1"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
          <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span>Total</span><span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div><label className="label">Notes</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="input" rows={2} /></div>
      </div>
      <div className="flex justify-end gap-3 p-6 pt-0">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : invoice?._id ? 'Update' : 'Create Invoice'}</button>
      </div>
    </form>
  )
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [stats, setStats] = useState({})
  const navigate = useNavigate()

  const fetch = async (p = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p, limit: 15 })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const { data } = await api.get(`/invoices?${params}`)
      setInvoices(data.invoices)
      setPages(data.pages)
      setTotal(data.total)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch(1) }, [statusFilter])
  useEffect(() => { const t = setTimeout(() => fetch(1), 400); return () => clearTimeout(t) }, [search])
  useEffect(() => {
    api.get('/invoices/stats/revenue').then(r => {
      const d = r.data
      const paid = d.reduce((s, m) => s + m.revenue, 0)
      setStats({ totalRevenue: paid })
    }).catch(() => {})
  }, [])

  const handleSave = (inv) => {
    setInvoices(prev => {
      const idx = prev.findIndex(i => i._id === inv._id)
      if (idx >= 0) { const n = [...prev]; n[idx] = inv; return n }
      return [inv, ...prev]
    })
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/invoices/${id}`); setInvoices(p => p.filter(i => i._id !== id)); toast.success('Deleted') } catch { toast.error('Error') }
  }

  const pending = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.totalAmount, 0)
  const overdue = invoices.filter(i => i.status === 'overdue')

  return (
    <div className="space-y-5 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Billing & Invoices</h2>
          <p className="text-sm text-gray-500">{total} invoices total</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary"><PlusIcon className="w-4 h-4" /> New Invoice</button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={stats.totalRevenue || 0} prefix="$" icon={CurrencyDollarIcon} color="brand" />
        <KPICard title="Pending" value={pending} prefix="$" icon={ClockIcon} color="amber" />
        <KPICard title="Overdue" value={overdue.length} suffix=" invoices" icon={ExclamationTriangleIcon} color="rose" />
        <KPICard title="Total Invoices" value={total} icon={CheckCircleIcon} color="teal" />
      </div>

      {/* Filters + table */}
      <div className="card p-4 flex gap-3">
        <div className="relative flex-1"><MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." className="input pl-9" /></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-36">
          {['', 'draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'].map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Due Date</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="px-6 py-8"><TableSkeleton rows={8} cols={6} /></td></tr>
                : invoices.length === 0 ? <tr><td colSpan={7}><EmptyState title="No invoices found" description="Create your first invoice to start tracking billing." action={<button onClick={() => setModal('create')} className="btn-primary">Create Invoice</button>} /></td></tr>
                : invoices.map((inv, i) => (
                  <motion.tr key={inv._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="table-row">
                    <td className="px-6 py-4"><span className="font-mono text-sm text-brand-700 dark:text-brand-300 font-semibold">{inv.invoiceNumber}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-violet-700 flex items-center justify-center text-white text-xs font-bold">{avatarText(inv.customerName)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{inv.customerName}</div>
                          <div className="text-xs text-gray-400">{inv.customerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(inv.totalAmount)}</span></td>
                    <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-500">{formatDate(inv.dueDate)}</td>
                    <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-500">{formatDate(inv.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/billing/${inv._id}`)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-brand-600 transition-colors"><EyeIcon className="w-4 h-4" /></button>
                        <button onClick={() => setModal(inv)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(inv._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} total={total} onPage={p => { setPage(p); fetch(p) }} />
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'New Invoice' : 'Edit Invoice'} size="xl">
        <InvoiceForm invoice={modal === 'create' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />
      </Modal>
    </div>
  )
}
