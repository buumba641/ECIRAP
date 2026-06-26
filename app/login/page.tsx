'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, type UserRole } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface DemoUser {
  email: string
  name: string
  role: UserRole
  avatar_color: string
}

const DEMO_USERS: DemoUser[] = [
  { email: 'ceo@ecirap.com', name: 'James', role: 'CEO', avatar_color: '#FF6B6B' },
  { email: 'manager@ecirap.com', name: 'Sarah', role: 'Manager', avatar_color: '#4ECDC4' },
  { email: 'sales@ecirap.com', name: 'Mike', role: 'Sales', avatar_color: '#45B7D1' },
  { email: 'cashier@ecirap.com', name: 'Emma', role: 'Cashier', avatar_color: '#96CEB4' },
  { email: 'analyst@ecirap.com', name: 'David', role: 'Analyst', avatar_color: '#FFEAA7' },
  { email: 'accountant@ecirap.com', name: 'Lisa', role: 'Accountant', avatar_color: '#DDA15E' },
  { email: 'user@ecirap.com', name: 'John', role: 'User', avatar_color: '#A8DADC' },
  { email: 'hr@ecirap.com', name: 'Rachel', role: 'HR', avatar_color: '#F1FAEE' },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, loading } = useAuth()
  const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null)
  const [error, setError] = useState('')

  const handleLogin = async (user: DemoUser) => {
    setSelectedUser(user)
    setError('')

    try {
      await login(user.email, 'demo123')
      router.push('/dashboard')
    } catch (err) {
      setError('Login failed. Please try again.')
      setSelectedUser(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">ECIRAP</h1>
          <p className="text-slate-400 text-lg">
            Enterprise Commercial Intelligence & Revenue Assurance Platform
          </p>
          <p className="text-slate-500 text-sm mt-4">Select your role to login</p>
        </div>

        {/* User Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {DEMO_USERS.map((user) => (
            <button
              key={user.email}
              onClick={() => handleLogin(user)}
              disabled={loading}
              className="group relative"
            >
              <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-slate-600">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg hover:scale-110 transition-transform"
                  style={{ backgroundColor: user.avatar_color }}
                >
                  {user.name.charAt(0)}
                </div>

                {/* Name */}
                <h3 className="font-semibold text-slate-900 mb-1">{user.name}</h3>

                {/* Role */}
                <p className="text-sm text-slate-500 mb-4">{user.role}</p>

                {/* Click indicator */}
                <div className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to login
                </div>

                {/* Loading state */}
                {loading && selectedUser?.email === user.email && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  </div>
                )}
              </Card>
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        {/* Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
          <p className="text-slate-300 text-sm">
            This is a demo environment. Click on any user avatar to login.
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Each role has access to different features and dashboards
          </p>
        </div>
      </div>
    </div>
  )
}
