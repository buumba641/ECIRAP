// Sales Agent Dashboard - Personal pipeline, leads, and commissions
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import type { Lead, Invoice, AgentCommission } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, Target, AlertCircle } from 'lucide-react'

export default function SalesDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [commissions, setCommissions] = useState<AgentCommission[]>([])
  const [dashLoading, setDashLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user || user.role !== 'Sales') {
      router.push('/login')
      return
    }

    fetchDashboardData()
  }, [user, loading, router])

  const fetchDashboardData = async () => {
    try {
      setDashLoading(true)
      const [leadsRes, invoicesRes, commissionsRes] = await Promise.all([
        fetch(`/api/leads?agent_id=${user?.user_id}`),
        fetch(`/api/invoices?agent_id=${user?.user_id}`),
        fetch(`/api/commissions?agent_id=${user?.user_id}`),
      ])

      if (leadsRes.ok) setLeads(await leadsRes.json())
      if (invoicesRes.ok) setInvoices(await invoicesRes.json())
      if (commissionsRes.ok) setCommissions(await commissionsRes.json())
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

  const openLeads = leads.filter(l => !l.is_converted).length
  const closedDeals = invoices.filter(i => i.status === 'Closed_Approved').length
  const totalCommissions = commissions.reduce((sum, c) => sum + c.commission_amount, 0)
  const conversionRate = leads.length > 0 ? ((closedDeals / leads.length) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user.full_name}</p>
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open Leads</p>
              <p className="text-3xl font-bold">{openLeads}</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Closed Deals</p>
              <p className="text-3xl font-bold">{closedDeals}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="text-3xl font-bold">{conversionRate}%</p>
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Commission</p>
            <p className="text-3xl font-bold">${totalCommissions.toFixed(2)}</p>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={() => router.push('/dashboard/sales/new-lead')} className="gap-2">
          <Plus className="h-4 w-4" /> New Lead
        </Button>
      </div>

      {/* Leads Table */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">My Leads</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Client Name</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                    No leads yet
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.lead_id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-2">{lead.client_name}</td>
                    <td className="px-4 py-2">{lead.phone_number}</td>
                    <td className="px-4 py-2">{lead.email_address}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${
                        lead.is_converted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {lead.is_converted ? 'Converted' : 'Open'}
                      </span>
                    </td>
                    <td className="px-4 py-2">{new Date(lead.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Closed Deals */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Closed Deals</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">Payment Type</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">
                    No closed deals yet
                  </td>
                </tr>
              ) : (
                invoices.map(invoice => {
                  const lead = leads.find(l => l.lead_id === invoice.lead_id)
                  return (
                    <tr key={invoice.invoice_id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-2">{lead?.client_name || 'N/A'}</td>
                      <td className="px-4 py-2">
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                          {invoice.payment_type}
                        </span>
                      </td>
                      <td className="px-4 py-2">{invoice.status}</td>
                      <td className="px-4 py-2">
                        {invoice.conversion_timestamp ? new Date(invoice.conversion_timestamp).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
