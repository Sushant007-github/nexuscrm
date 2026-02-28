import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { SunIcon, MoonIcon, ShieldCheckIcon, BuildingOfficeIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../../utils/api'

export default function SettingsPage() {
  const { user } = useAuth()
  const { isDark, toggle } = useTheme()
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.new !== passwordForm.confirm) return toast.error('Passwords do not match')
    if (passwordForm.new.length < 6) return toast.error('Password must be at least 6 characters')
    setSaving(true)
    try {
      await api.put(`/users/${user._id}`, { password: passwordForm.new })
      toast.success('Password updated successfully')
      setPasswordForm({ current: '', new: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const Section = ({ icon: Icon, title, children }) => (
    <motion.div className="card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </div>
        <h3 className="font-display font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  )

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Section icon={UserCircleIcon} title="Profile Information">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Full Name</label>
            <input defaultValue={user?.name} className="input" disabled />
          </div>
          <div><label className="label">Email</label>
            <input defaultValue={user?.email} className="input" disabled />
          </div>
          <div><label className="label">Role</label>
            <input defaultValue={user?.role?.replace('_', ' ')} className="input capitalize" disabled />
          </div>
          <div><label className="label">Department</label>
            <input defaultValue={user?.department || '—'} className="input" disabled />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Contact an admin to update profile information.</p>
      </Section>

      {/* Appearance */}
      <Section icon={SunIcon} title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Color Theme</div>
            <div className="text-xs text-gray-500 mt-0.5">Switch between light and dark mode</div>
          </div>
          <button
            onClick={toggle}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${isDark ? 'bg-brand-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 flex items-center justify-center ${isDark ? 'translate-x-8' : 'translate-x-1'}`}>
              {isDark ? <MoonIcon className="w-3 h-3 text-brand-600" /> : <SunIcon className="w-3 h-3 text-amber-500" />}
            </span>
          </button>
        </div>
      </Section>

      {/* Security */}
      <Section icon={ShieldCheckIcon} title="Security">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" value={passwordForm.current} onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))} className="input" placeholder="••••••••" required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" value={passwordForm.new} onChange={e => setPasswordForm(f => ({ ...f, new: e.target.value }))} className="input" placeholder="Min 6 characters" required />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))} className="input" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </Section>

      {/* Organization */}
      <Section icon={BuildingOfficeIcon} title="Organization">
        <div className="space-y-3 text-sm">
          {[
            ['Organization ID', user?.organizationId],
            ['Industry Mode', 'All Modules'],
            ['Platform', 'NexusCRM Enterprise v1.0'],
            ['Environment', import.meta.env.MODE || 'production'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-gray-500">{k}</span>
              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg text-gray-700 dark:text-gray-300">{v}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
