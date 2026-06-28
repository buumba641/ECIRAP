'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { UserRole } from './types'

export interface AuthUser {
  user_id: string
  branch_id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
}

export interface RolePermissions {
  readCRM?: boolean
  writeCRM?: boolean
  readFinancial?: boolean
  writeFinancial?: boolean
  manageUsers?: boolean
  approveDisbursement?: boolean
  requestDisbursement?: boolean
  logCampaigns?: boolean
  readRoi?: boolean
  readGlobal?: boolean
  filterByBranch?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  permissions: RolePermissions | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: keyof RolePermissions) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Role-based permissions matrix
const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  Sales: { readCRM: true, writeCRM: true, readRoi: true },
  Cashier: { writeFinancial: true, readFinancial: true },
  HR: { manageUsers: true, readCRM: true },
  Marketing: { logCampaigns: true, readRoi: true },
  Analyst: { readCRM: true, readFinancial: true, readRoi: true },
  Accountant: { readFinancial: true, requestDisbursement: true, readCRM: true },
  Manager: { readCRM: true, approveDisbursement: true, readFinancial: true, readRoi: true },
  CEO: { readGlobal: true, filterByBranch: true, readCRM: true, readFinancial: true, readRoi: true },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [permissions, setPermissions] = useState<RolePermissions | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('starlink_user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setPermissions(ROLE_PERMISSIONS[parsedUser.role] || {})
      } catch (e) {
        localStorage.removeItem('starlink_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      setUser(data.user)
      setPermissions(ROLE_PERMISSIONS[data.user.role] || {})
      localStorage.setItem('starlink_user', JSON.stringify(data.user))
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setPermissions(null)
    localStorage.removeItem('starlink_user')
  }

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions?.[permission] ?? false
  }

  return (
    <AuthContext.Provider value={{ user, loading, permissions, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (undefined === context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
