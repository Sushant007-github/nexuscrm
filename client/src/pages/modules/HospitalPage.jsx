import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HeartIcon, PlusIcon } from '@heroicons/react/24/outline'
import { StatusBadge, EmptyState, KPICard } from '../../components/ui'
import { formatDate, avatarText } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

function ModuleCard({ title, value, icon: Icon, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
      </div>
    </div>
  )
}

export function HospitalPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/records?type=patient&industry=hospital&limit=20')
      .then(r => setPatients(r.data.records))
      .catch(() => toast.error('Error loading patients'))
      .finally(() => setLoading(false))
  }, [])

  const byType = (type) => patients.filter(p => p.admissionType === type).length

  return (
    <div className="space-y-5 max-w-[1600px]">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-sm">
          <HeartIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Hospital Module</h2>
          <p className="text-sm text-gray-500">Patient & ward management</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Patients', value: patients.length, icon: HeartIcon, color: 'bg-red-500' },
          { title: 'OPD', value: byType('OPD'), icon: HeartIcon, color: 'bg-blue-500' },
          { title: 'IPD', value: byType('IPD'), icon: HeartIcon, color: 'bg-violet-500' },
          { title: 'ICU', value: byType('ICU'), icon: HeartIcon, color: 'bg-orange-500' },
        ].map((c, i) => <ModuleCard key={i} {...c} />)}
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">Patient Registry</h3>
          <a href="/records" className="text-sm text-brand-600 hover:text-brand-700">View all records →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700">
              {['Patient', 'Admission Type', 'Ward', 'Diagnosis', 'Status', 'Admitted'].map(h => (
                <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
                : patients.length === 0 ? <tr><td colSpan={6}><EmptyState icon={HeartIcon} title="No patients" description="Add patients via the Records module." /></td></tr>
                : patients.map((p, i) => (
                  <tr key={p._id} className="table-row">
                    <td className="px-6 py-4"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center text-xs font-bold">{avatarText(p.name)}</div><span className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</span></div></td>
                    <td className="px-6 py-4"><span className="badge bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">{p.admissionType || '—'}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{p.ward || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{p.diagnosis || '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.admissionDate || p.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default HospitalPage
