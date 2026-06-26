'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import CEODashboard from '@/components/dashboards/ceo-dashboard'
import ManagerDashboard from '@/components/dashboards/manager-dashboard'
import SalesDashboard from '@/components/dashboards/sales-dashboard'
import CashierDashboard from '@/components/dashboards/cashier-dashboard'
import AnalystDashboard from '@/components/dashboards/analyst-dashboard'
import AccountantDashboard from '@/components/dashboards/accountant-dashboard'
import UserDashboard from '@/components/dashboards/user-dashboard'
import HRDashboard from '@/components/dashboards/hr-dashboard'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  // Route to role-specific dashboard
  switch (user.role) {
    case 'CEO':
      return <CEODashboard />
    case 'Manager':
      return <ManagerDashboard />
    case 'Sales':
      return <SalesDashboard />
    case 'Cashier':
      return <CashierDashboard />
    case 'Analyst':
      return <AnalystDashboard />
    case 'Accountant':
      return <AccountantDashboard />
    case 'HR':
      return <HRDashboard />
    default:
      return <UserDashboard />
  }
}
