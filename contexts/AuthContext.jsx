"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null)

  const fetchMe = async (token) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Unauthorized')
      const data = await res.json()
      return data.user
    } catch {
      return null
    }
  }

  useEffect(() => {
    const init = async () => {
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }
      const me = await fetchMe(token)
      if (me) {
        setUser(me)
      } else {
        localStorage.removeItem('auth_token')
      }
      setLoading(false)
    }

    init()
  }, [])

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Unable to login' }))
      throw new Error(error.message || 'Unable to login')
    }

    const data = await res.json()
    localStorage.setItem('auth_token', data.token)
    setUser(data.user)
    return data.user
  }

  const signup = async (name, email, password) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Unable to sign up' }))
      throw new Error(error.message || 'Unable to sign up')
    }

    return await res.json()
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
