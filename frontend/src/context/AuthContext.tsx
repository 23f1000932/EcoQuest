import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase'
import { apiClient, setAuthToken } from '../api/client'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  authModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const verifyWithBackend = useCallback(async (supabaseToken: string) => {
    try {
      const response = await apiClient.post('/auth/verify', {
        supabase_token: supabaseToken,
      })
      const { user: userData, access_token } = response.data
      setAuthToken(access_token)
      setUser(userData)
    } catch (error) {
      console.error('Backend verification failed:', error)
      setUser(null)
      setAuthToken(null)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/users/me')
      setUser(response.data)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        verifyWithBackend(session.access_token).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        await verifyWithBackend(session.access_token)
        setAuthModalOpen(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setAuthToken(null)
      } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        await verifyWithBackend(session.access_token)
      }
    })

    return () => subscription.unsubscribe()
  }, [verifyWithBackend])

  const openAuthModal = () => setAuthModalOpen(true)
  const closeAuthModal = () => setAuthModalOpen(false)

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    await apiClient.post('/auth/logout').catch(() => {})
    setUser(null)
    setAuthToken(null)
  }

  return (
    <AuthContext.Provider value={{
      user, loading, authModalOpen,
      openAuthModal, closeAuthModal,
      signInWithGoogle, signInWithEmail, signUpWithEmail,
      signOut, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
