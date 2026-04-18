import { createContext, useContext, useEffect, useState } from 'react'
import { getMeApi, logoutApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cc_token')
    if (!token) {
      setLoading(false)
      return
    }
    getMeApi()
      .then((res) => setUser(res.data.data.user))
      .catch(() => localStorage.removeItem('cc_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('cc_token', token)
    setUser(userData)
  }

  const logout = async () => {
    try { await logoutApi() } catch {}
    localStorage.removeItem('cc_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}