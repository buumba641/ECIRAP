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
        {/* Logo SVG */}
        <div className="text-center mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="620"
            height="180"
            viewBox="0 0 620 180"
            fill="none"
            className="w-full max-w-md mx-auto"
          >
            <defs>
              <linearGradient id="mainGrad" x1="0%" y1="20%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="50%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="accentGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {/* Stylized ECIRAP Letters */}
            <g transform="translate(40, 45)">
              {/* E */}
              <text
                x="0"
                y="85"
                fontFamily="Inter, Arial Black, sans-serif"
                fontSize="92"
                fontWeight="900"
                fill="url(#mainGrad)"
                letterSpacing="-4"
              >
                E
              </text>
              {/* C (overlapping E) */}
              <text
                x="68"
                y="85"
                fontFamily="Inter, Arial Black, sans-serif"
                fontSize="92"
                fontWeight="900"
                fill="url(#mainGrad)"
                letterSpacing="-4"
                opacity="0.95"
              >
                C
              </text>
              {/* I */}
              <text
                x="135"
                y="85"
                fontFamily="Inter, Arial Black, sans-serif"
                fontSize="92"
                fontWeight="900"
                fill="url(#mainGrad)"
              >
                I
              </text>
              {/* R (with accent connection) */}
              <text
                x="185"
                y="85"
                fontFamily="Inter, Arial Black, sans-serif"
                fontSize="92"
                fontWeight="900"
                fill="url(#mainGrad)"
              >
                R
              </text>
              {/* A */}
              <text
                x="255"
                y="85"
                fontFamily="Inter, Arial Black, sans-serif"
                fontSize="92"
                fontWeight="900"
                fill="url(#mainGrad)"
              >
                A
              </text>
              {/* P (with orange accent bar) */}
              <text
                x="325"
                y="85"
                fontFamily="Inter, Arial Black, sans-serif"
                fontSize="92"
                fontWeight="900"
                fill="url(#mainGrad)"
              >
                P
              </text>
            </g>
            {/* Accent Connection Line (symbolizing integration) */}
            <path
              d="M135 95 Q190 45 255 95"
              fill="none"
              stroke="url(#accentGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Subtle underline accent */}
            <rect x="45" y="135" width="415" height="6" rx="3" fill="url(#accentGrad)" />
            {/* Full Name Below */}
            <text
              x="48"
              y="165"
              fontFamily="Inter, Arial, sans-serif"
              fontSize="13.5"
              fontWeight="700"
              fill="#64748B"
              letterSpacing="3.5"
            >
              ENTERPRISE COMMERCIAL INTELLIGENCE &amp; REVENUE ASSURANCE PLATFORM
            </text>
          </svg>
        </div>

        {/* Description */}
        <div className="text-center mb-12">
          <p className="text-slate-400 text-lg mb-2">
            Commercial Intelligence Platform
          </p>
          <p className="text-slate-500 text-sm">Select your role to login</p>
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

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>Demo credentials: demo123</p>
        </div>
      </div>
    </div>
  )
}
