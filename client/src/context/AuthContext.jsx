import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => localStorage.getItem('crm_token'))

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } catch {
      localStorage.removeItem('crm_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [token, fetchMe])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('crm_token', data.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('crm_token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  const hasRole = (...roles) => user && roles.includes(user.role)

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a1220 0%, #0d2240 50%, #0a1a35 100%)'
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid rgba(255,255,255,0.2)',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#93c5fd', marginTop: 16, fontSize: 14 }}>Connecting to server...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
