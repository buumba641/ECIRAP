'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HRDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'HR')) {
      router.push('/login')
    }
  }, [user, loading, router])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">HR Dashboard</h1>
      <p className="text-muted-foreground">User management and administration</p>
    </div>
  )
}
