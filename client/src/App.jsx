import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import RecordsPage from './pages/records/RecordsPage'
import RecordDetailPage from './pages/records/RecordDetailPage'
import BillingPage from './pages/billing/BillingPage'
import InvoiceDetailPage from './pages/billing/InvoiceDetailPage'
import UsersPage from './pages/users/UsersPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import AttendancePage from './pages/modules/AttendancePage'
import HospitalPage from './pages/modules/HospitalPage'
import SchoolPage from './pages/modules/SchoolPage'
import RestaurantPage from './pages/modules/RestaurantPage'
import SettingsPage from './pages/settings/SettingsPage'
import AuditPage from './pages/settings/AuditPage'

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ className: '!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100 !shadow-soft-lg !rounded-2xl !border !border-gray-100 dark:!border-gray-700', duration: 3500 }} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="records" element={<RecordsPage />} />
              <Route path="records/:id" element={<RecordDetailPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="billing/:id" element={<InvoiceDetailPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="modules/hospital" element={<HospitalPage />} />
              <Route path="modules/school" element={<SchoolPage />} />
              <Route path="modules/restaurant" element={<RestaurantPage />} />
              <Route path="users" element={<ProtectedRoute roles={['super_admin', 'admin']}><UsersPage /></ProtectedRoute>} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="audit" element={<ProtectedRoute roles={['super_admin', 'admin']}><AuditPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

