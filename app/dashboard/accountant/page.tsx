'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AccountantDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Accountant')) {
      router.push('/login')
    }
  }, [user, loading, router])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Accountant Dashboard</h1>
      <p className="text-muted-foreground">Payroll and financial management</p>
    </div>
  )
}
