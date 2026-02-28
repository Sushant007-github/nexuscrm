import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { StatusBadge } from '../../components/ui'
import { formatDate, formatRelative, avatarText } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function RecordDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)

  useEffect(() => {
    api.get(`/records/${id}`).then(r => setRecord(r.data)).catch(() => toast.error('Record not found')).finally(() => setLoading(false))
  }, [id])

  const addNote = async (e) => {
    e.preventDefault()
    if (!note.trim()) return
    setAddingNote(true)
    try {
      const { data } = await api.post(`/records/${id}/notes`, { content: note })
      setRecord(data)
      setNote('')
    } catch { toast.error('Error adding note') }
    finally { setAddingNote(false) }
  }

  if (loading) return <div className="card p-12 text-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
  if (!record) return <div className="card p-12 text-center text-gray-500">Record not found</div>

  return (
    <div className="max-w-4xl space-y-5">
      <button onClick={() => navigate('/records')} className="btn-ghost text-sm">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Records
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-5">
          <motion.div className="card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-lg font-bold shadow-brand">
                {avatarText(record.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white">{record.name}</h1>
                  <StatusBadge status={record.status} />
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
                  {record.email && <span>✉ {record.email}</span>}
                  {record.phone && <span>📞 {record.phone}</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">{record.type}</span>
                  <span className="badge bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 capitalize">{record.industry}</span>
                  {(record.tags || []).map(t => <span key={t} className="badge bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">{t}</span>)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Industry-specific info */}
          {record.industry === 'hospital' && (
            <motion.div className="card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Clinical Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Patient ID', record.patientId || '—'],
                  ['Admission Type', record.admissionType || '—'],
                  ['Ward', record.ward || '—'],
                  ['Diagnosis', record.diagnosis || '—'],
                  ['Admission Date', formatDate(record.admissionDate)],
                  ['Discharge Date', formatDate(record.dischargeDate)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-gray-500">{k}</div>
                    <div className="font-medium text-gray-900 dark:text-white mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {record.industry === 'school' && (
            <motion.div className="card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Academic Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Student ID', record.studentId || '—'],
                  ['Grade', record.grade || '—'],
                  ['Section', record.section || '—'],
                  ['Parent Name', record.parentName || '—'],
                  ['Parent Phone', record.parentPhone || '—'],
                  ['Fee Status', record.feeStatus || '—'],
                  ['Enrollment Date', formatDate(record.enrollmentDate)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-gray-500">{k}</div>
                    <div className="font-medium text-gray-900 dark:text-white mt-0.5 capitalize">{v}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Notes */}
          <motion.div className="card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Notes & Activity</h3>
            <form onSubmit={addNote} className="flex gap-3 mb-5">
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." className="input flex-1" />
              <button type="submit" disabled={addingNote || !note.trim()} className="btn-primary flex-shrink-0 py-2.5">
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </form>
            <div className="space-y-3">
              {(record.notes || []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No notes yet.</p>
              ) : [...(record.notes || [])].reverse().map((n, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 flex-shrink-0 mt-0.5">
                    {avatarText(n.createdBy?.name || 'U')}
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{n.createdBy?.name || 'Unknown'}</span>
                      <span className="text-xs text-gray-400">{formatRelative(n.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{n.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <motion.div className="card p-5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Record Details</h4>
            <div className="space-y-3 text-sm">
              {[
                ['Created', formatDate(record.createdAt)],
                ['Updated', formatDate(record.updatedAt)],
                ['Assigned To', record.assignedTo?.name || 'Unassigned'],
                ['Created By', record.createdBy?.name || 'System'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
