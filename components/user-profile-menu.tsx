'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export function UserProfileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()

  if (!user) return null

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    router.push('/login')
  }

  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title={`${user.full_name} (${user.role})`}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: user.avatar_color }}
        >
          {initials}
        </div>
        <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-50">
          {/* User Info Header */}
          <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white"
                style={{ backgroundColor: user.avatar_color }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {user.full_name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Role: <span className="font-semibold text-slate-600 dark:text-slate-300">{user.role}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                router.push('/hr-admin')
                setIsOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Account Settings
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-200 dark:border-slate-700 py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
