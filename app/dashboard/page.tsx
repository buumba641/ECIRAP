'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    // Route to role-specific dashboard
    const dashboardPaths: Record<string, string> = {
      CEO: '/dashboard/ceo',
      Manager: '/dashboard/manager',
      Sales: '/dashboard/sales',
      Cashier: '/dashboard/cashier',
      Analyst: '/dashboard/analyst',
      Accountant: '/dashboard/accountant',
      HR: '/dashboard/hr',
      Marketing: '/dashboard/marketing',
    }

    const path = dashboardPaths[user.role] || '/dashboard/sales'
    router.push(path)
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecting to your dashboard...</p>
    </div>
  )
}
