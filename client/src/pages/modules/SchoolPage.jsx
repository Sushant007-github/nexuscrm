import { useEffect, useState } from 'react'
import { AcademicCapIcon } from '@heroicons/react/24/outline'
import { StatusBadge, EmptyState } from '../../components/ui'
import { formatDate, avatarText } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function SchoolPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/records?type=student&industry=school&limit=30')
      .then(r => setStudents(r.data.records))
      .catch(() => toast.error('Error loading students'))
      .finally(() => setLoading(false))
  }, [])

  const paid = students.filter(s => s.feeStatus === 'paid').length
  const unpaid = students.filter(s => s.feeStatus === 'unpaid').length

  return (
    <div className="space-y-5 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm"><AcademicCapIcon className="w-5 h-5 text-white" /></div>
        <div><h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">School Module</h2><p className="text-sm text-gray-500">Student & academic management</p></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[['Total Students', students.length, 'bg-amber-500'], ['Fee Paid', paid, 'bg-emerald-500'], ['Fee Unpaid', unpaid, 'bg-red-500'], ['Active', students.filter(s => s.status === 'active').length, 'bg-blue-500']].map(([t, v, c], i) => (
          <div key={i} className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${c} flex items-center justify-center text-white text-lg font-bold shadow-sm`}>{v}</div>
            <div><div className="text-2xl font-display font-bold text-gray-900 dark:text-white">{v}</div><div className="text-sm text-gray-500">{t}</div></div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Student Registry</h3>
          <a href="/records" className="text-sm text-brand-600">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700">
              {['Student', 'Grade / Section', 'Parent', 'Fee Status', 'Enrolled', 'Status'].map(h => (
                <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
                : students.length === 0 ? <tr><td colSpan={6}><EmptyState icon={AcademicCapIcon} title="No students" description="Add students via the Records module." /></td></tr>
                : students.map(s => (
                  <tr key={s._id} className="table-row">
                    <td className="px-6 py-4"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs font-bold">{avatarText(s.name)}</div><span className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</span></div></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{s.grade || '—'} {s.section ? `/ ${s.section}` : ''}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{s.parentName || '—'}</td>
                    <td className="px-6 py-4"><span className={`badge capitalize ${s.feeStatus === 'paid' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : s.feeStatus === 'unpaid' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'}`}>{s.feeStatus || '—'}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(s.enrollmentDate || s.createdAt)}</td>
                    <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

