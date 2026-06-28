// CEO Dashboard - Global view with branch filtering
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import type { Branch, Invoice, User } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { AlertCircle } from 'lucide-react'

export default function CEODashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string | 'all'>('all')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [dashLoading, setDashLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user || user.role !== 'CEO') {
      router.push('/login')
      return
    }

    fetchDashboardData()
  }, [user, loading, router, selectedBranch])

  const fetchDashboardData = async () => {
    try {
      setDashLoading(true)
      const branchFilter = selectedBranch === 'all' ? '' : `?branch=${selectedBranch}`
      
      const [branchesRes, invoicesRes, usersRes] = await Promise.all([
        fetch('/api/branches'),
        fetch(`/api/invoices${branchFilter}`),
        fetch(`/api/users${branchFilter}`),
      ])

      if (branchesRes.ok) setBranches(await branchesRes.json())
      if (invoicesRes.ok) setInvoices(await invoicesRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setDashLoading(false)
    }
  }

  if (loading || dashLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>
  }

  if (!user) {
    return null
  }

  const closedDeals = invoices.filter(i => i.status === 'Closed_Approved').length
  const totalRevenue = invoices
    .filter(i => i.status === 'Closed_Approved')
    .reduce((sum) => sum + 0, 0) // Placeholder - would need invoice amounts
  const avgDealSize = closedDeals > 0 ? totalRevenue / closedDeals : 0

  // Revenue by branch (mock data)
  const revenueByBranch = [
    { name: 'Lusaka Downtown', revenue: 45000, deals: 15 },
    { name: 'Harare Central', revenue: 38000, deals: 12 },
    { name: 'Bulawayo Hub', revenue: 28000, deals: 9 },
  ]

  // Sales trend (mock data)
  const salesTrend = [
    { month: 'Jan', sales: 28000, target: 30000 },
    { month: 'Feb', sales: 35000, target: 30000 },
    { month: 'Mar', sales: 42000, target: 35000 },
    { month: 'Apr', sales: 38000, target: 40000 },
    { month: 'May', sales: 52000, target: 45000 },
    { month: 'Jun', sales: 61000, target: 50000 },
  ]

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">CEO Dashboard - Global View</h1>
        <div className="flex items-center gap-4">
          <label htmlFor="branch-filter" className="text-sm font-medium">Filter by Branch:</label>
          <select
            id="branch-filter"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded border border-input bg-background px-3 py-2"
          >
            <option value="all">All Branches</option>
            {branches.map(branch => (
              <option key={branch.branch_id} value={branch.branch_id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Closed Deals</p>
          <p className="text-3xl font-bold">{closedDeals}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-3xl font-bold">${(totalRevenue / 1000).toFixed(1)}K</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Avg Deal Size</p>
          <p className="text-3xl font-bold">${(avgDealSize / 1000).toFixed(1)}K</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Active Sales Agents</p>
          <p className="text-3xl font-bold">{users.filter(u => u.role === 'Sales').length}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by Branch */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Revenue by Branch</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByBranch}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Sales Trend */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Sales Trend vs Target</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name="Actual Sales" />
              <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Branch Summary Table */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Branch Performance Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Branch</th>
                <th className="px-4 py-2 text-left">Deals Closed</th>
                <th className="px-4 py-2 text-left">Revenue</th>
                <th className="px-4 py-2 text-left">Agents</th>
                <th className="px-4 py-2 text-left">Performance</th>
              </tr>
            </thead>
            <tbody>
              {revenueByBranch.map(branch => (
                <tr key={branch.name} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-2 font-medium">{branch.name}</td>
                  <td className="px-4 py-2">{branch.deals}</td>
                  <td className="px-4 py-2">${(branch.revenue / 1000).toFixed(1)}K</td>
                  <td className="px-4 py-2">{Math.floor(Math.random() * 5) + 3}</td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      On Track
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
