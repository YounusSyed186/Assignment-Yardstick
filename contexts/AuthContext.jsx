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
      console.log('[Auth] Fetching user with token:', token ? token.substring(0, 20) + '...' : 'none')
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      if (!res.ok) {
        console.error('[Auth] fetchMe failed with status:', res.status)
        throw new Error('Unauthorized')
      }
      const data = await res.json()
      console.log('[Auth] User fetched successfully:', data.user?.email)
      return data.user
    } catch (err) {
      console.error('[Auth] fetchMe error:', err.message)
      return null
    }
  }

  useEffect(() => {
    const init = async () => {
      const token = getToken()
      if (!token) {
        console.log('[Auth] No token found in localStorage, skipping user fetch')
        setLoading(false)
        return
      }
      console.log('[Auth] Token found, checking if valid')
      const me = await fetchMe(token)
      if (me) {
        setUser(me)
        console.log('[Auth] User restored from token')
      } else {
        console.log('[Auth] Token invalid/expired, clearing')
        localStorage.removeItem('auth_token')
      }
      setLoading(false)
    }

    init()
  }, [])

  const login = async (email, password) => {
    console.log('[Auth] Attempting login for:', email)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Unable to login' }))
      console.error('[Auth] Login failed:', error.message)
      throw new Error(error.message || 'Unable to login')
    }

    const data = await res.json()
    console.log('[Auth] Login successful, storing token')
    localStorage.setItem('auth_token', data.token)
    setUser(data.user)
    return data.user
  }

  const signup = async (name, email, password) => {
    console.log('[Auth] Attempting signup for:', email)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include',
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Unable to sign up' }))
      console.error('[Auth] Signup failed:', error.message)
      throw new Error(error.message || 'Unable to sign up')
    }

    console.log('[Auth] Signup successful')
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
