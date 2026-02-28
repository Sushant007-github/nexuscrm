import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { StatusBadge, Modal, EmptyState } from '../../components/ui'
import { formatDate, avatarText } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = { present: 'bg-emerald-500', absent: 'bg-red-500', late: 'bg-amber-500', half_day: 'bg-orange-500', leave: 'bg-blue-500' }

export default function AttendancePage() {
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ entityType: 'staff', status: 'present', date: new Date().toISOString().slice(0, 10) })
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const [att, sum] = await Promise.all([
        api.get(`/attendance?date=${date}&limit=100`),
        api.get('/attendance/summary')
      ])
      setRecords(att.data.records)
      setSummary(sum.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [date])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/attendance', form)
      setRecords(prev => [data, ...prev])
      setModal(false)
      toast.success('Attendance marked')
    } catch (err) { toast.error(err.response?.data?.error || 'Error') }
    finally { setSaving(false) }
  }

  const summaryMap = Object.fromEntries(summary.map(s => [s._id, s.count]))

  return (
    <div className="space-y-5 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Attendance Tracking</h2>
          <p className="text-sm text-gray-500">Daily attendance management</p>
        </div>
        <div className="flex gap-2 items-center">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input w-40" />
          <button onClick={() => setModal(true)} className="btn-primary"><PlusIcon className="w-4 h-4" /> Mark Attendance</button>
        </div>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {['present', 'absent', 'late', 'half_day', 'leave'].map(s => (
          <div key={s} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${STATUS_COLORS[s]} flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-sm`}>
              {summaryMap[s] || 0}
            </div>
            <div>
              <div className="text-lg font-display font-bold text-gray-900 dark:text-white">{summaryMap[s] || 0}</div>
              <div className="text-xs text-gray-500 capitalize">{s.replace('_', ' ')}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Records table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Attendance for {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={CalendarIcon} title="No attendance records" description="No records found for this date." action={<button onClick={() => setModal(true)} className="btn-primary">Mark Attendance</button>} /></td></tr>
              ) : records.map((rec, i) => (
                <motion.tr key={rec._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="table-row">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white text-xs font-bold">{avatarText(rec.userId?.name || '?')}</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{rec.userId?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400 capitalize">{rec.userId?.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">{rec.entityType}</span></td>
                  <td className="px-6 py-4"><StatusBadge status={rec.status} /></td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{rec.notes || '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Mark Attendance" size="sm">
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-4">
            <div>
              <label className="label">Entity Type</label>
              <select value={form.entityType} onChange={e => setForm(f => ({ ...f, entityType: e.target.value }))} className="input">
                <option value="staff">Staff</option>
                <option value="student">Student</option>
                <option value="patient">Patient</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
                <option value="leave">Leave</option>
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <input value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input" placeholder="Any additional notes..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 p-6 pt-0">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Marking...' : 'Mark Attendance'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
