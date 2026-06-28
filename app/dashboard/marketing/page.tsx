'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MarketingDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Marketing')) {
      router.push('/login')
    }
  }, [user, loading, router])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Marketing Dashboard</h1>
      <p className="text-muted-foreground">Campaign tracking and ROI</p>
    </div>
  )
}
