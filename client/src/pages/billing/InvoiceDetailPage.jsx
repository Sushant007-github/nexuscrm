import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { StatusBadge } from '../../components/ui'
import { formatCurrency, formatDate } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/invoices/${id}`).then(r => setInvoice(r.data)).catch(() => toast.error('Not found')).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="card p-12 text-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
  if (!invoice) return <div className="card p-12 text-center">Invoice not found</div>

  const handlePrint = () => window.print()

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/billing')} className="btn-ghost text-sm"><ArrowLeftIcon className="w-4 h-4" /> Back</button>
        <button onClick={handlePrint} className="btn-secondary"><PrinterIcon className="w-4 h-4" /> Print PDF</button>
      </div>

      <motion.div className="card p-8 print:shadow-none" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Invoice header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-0.5">NexusCRM</div>
            <div className="text-sm text-gray-500">Enterprise Platform</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-mono font-bold text-brand-600 dark:text-brand-400">{invoice.invoiceNumber}</div>
            <div className="mt-1"><StatusBadge status={invoice.status} /></div>
          </div>
        </div>

        {/* Bill to / details */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bill To</div>
            <div className="font-semibold text-gray-900 dark:text-white">{invoice.customerName}</div>
            <div className="text-sm text-gray-500 mt-1">{invoice.customerEmail}</div>
            <div className="text-sm text-gray-500">{invoice.customerPhone}</div>
            {invoice.customerAddress && <div className="text-sm text-gray-500 mt-1">{invoice.customerAddress}</div>}
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Invoice Details</div>
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-500">Issue Date: </span><span className="font-medium">{formatDate(invoice.createdAt)}</span></div>
              <div><span className="text-gray-500">Due Date: </span><span className="font-medium">{formatDate(invoice.dueDate)}</span></div>
              {invoice.paidDate && <div><span className="text-gray-500">Paid Date: </span><span className="font-medium text-emerald-600">{formatDate(invoice.paidDate)}</span></div>}
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Tax</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, i) => (
                <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{item.description}</td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{item.taxRate}%</td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{item.discount}%</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatCurrency(invoice.taxAmount)}</span></div>
            {invoice.discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatCurrency(invoice.discountAmount)}</span></div>}
            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
              <span>Total</span><span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
            {invoice.paidAmount > 0 && (
              <>
                <div className="flex justify-between text-emerald-600"><span>Paid</span><span>{formatCurrency(invoice.paidAmount)}</span></div>
                <div className="flex justify-between font-bold text-orange-600 border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span>Balance Due</span><span>{formatCurrency(invoice.totalAmount - invoice.paidAmount)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.notes}</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
