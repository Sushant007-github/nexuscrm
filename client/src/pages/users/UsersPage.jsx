import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, PencilIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { Modal, EmptyState, TableSkeleton } from '../../components/ui'
import { avatarText, formatDate, roleColor, roleLabel } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

function UserForm({ user, onSave, onClose }) {
  const [form, setForm] = useState(user || { name: '', email: '', password: '', role: 'staff', department: '', isActive: true })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (user?._id) {
        const { password, ...data } = form
        const { data: updated } = await api.put(`/users/${user._id}`, data)
        onSave(updated)
        toast.success('User updated')
      } else {
        const { data } = await api.post('/users', form)
        onSave(data)
        toast.success('User created')
      }
      onClose()
    } catch (err) { toast.error(err.response?.data?.error || 'Error') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className="label">Full Name *</label><input required value={form.name} onChange={e => set('name', e.target.value)} className="input" /></div>
        <div><label className="label">Email *</label><input type="email" required value={form.email} onChange={e => set('email', e.target.value)} className="input" /></div>
        {!user && <div><label className="label">Password *</label><input type="password" required value={form.password} onChange={e => set('password', e.target.value)} className="input" placeholder="Min 6 characters" /></div>}
        <div><label className="label">Role</label>
          <select value={form.role} onChange={e => set('role', e.target.value)} className="input">
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <div><label className="label">Department</label><input value={form.department} onChange={e => set('department', e.target.value)} className="input" placeholder="Sales, Support..." /></div>
        {user && <div className="col-span-2 flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="sr-only peer" />
            <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-brand-500 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-brand-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Active</span>
        </div>}
      </div>
      <div className="flex justify-end gap-3 p-6 pt-0">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : user ? 'Update User' : 'Create User'}</button>
      </div>
    </form>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try { const { data } = await api.get('/users'); setUsers(data.users) }
    catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleSave = (user) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u._id === user._id)
      if (idx >= 0) { const n = [...prev]; n[idx] = user; return n }
      return [user, ...prev]
    })
  }

  return (
    <div className="space-y-5 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-sm text-gray-500">{users.length} users in your organization</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add User</button>
      </div>

      {/* Users grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="skeleton w-12 h-12 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-3 w-32" />
              </div>
            </div>
            <div className="skeleton h-3 w-20" />
          </div>
        )) : users.length === 0 ? (
          <div className="col-span-full">
            <EmptyState icon={ShieldCheckIcon} title="No users found" description="Add your first team member to get started." action={<button onClick={() => setModal('create')} className="btn-primary">Add User</button>} />
          </div>
        ) : users.map((user, i) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-hover p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-sm font-bold shadow-brand">
                  {avatarText(user.name)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-xs text-gray-400 truncate max-w-[130px]">{user.email}</div>
                </div>
              </div>
              <button onClick={() => setModal(user)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                <PencilIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className={`badge ${roleColor(user.role)}`}>{roleLabel(user.role)}</span>
              <span className={`badge ${user.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {user.department && <div className="mt-2 text-xs text-gray-500">{user.department}</div>}
            <div className="mt-2 text-xs text-gray-400">Last login: {user.lastLogin ? formatDate(user.lastLogin, { month: 'short', day: 'numeric' }) : 'Never'}</div>
          </motion.div>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add New User' : 'Edit User'} size="md">
        <UserForm user={modal === 'create' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />
      </Modal>
    </div>
  )
}
