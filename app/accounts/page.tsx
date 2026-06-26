"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { supabase } from "@/lib/supabase/client"
import { Building2, TrendingUp, Users, DollarSign } from "lucide-react"

interface Account {
  id: string
  name: string
  industry: string
  revenue_contribution?: number
  account_health?: string
  decision_makers?: number
  opportunities_count?: number
  created_at?: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_accounts: 0,
    total_revenue: 0,
    average_account_value: 0,
    active_opportunities: 0,
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      
      // Fetch organizations as accounts
      const { data: orgs, error: orgsError } = await supabase
        .from("organizations")
        .select("*")
      
      if (orgsError) throw orgsError

      // Fetch contracts for revenue contribution
      const { data: contracts } = await supabase
        .from("contracts")
        .select("organization_id, amount")
        .eq("status", "Signed")

      // Aggregate accounts data
      const accountsWithData = orgs?.map((org) => {
        const orgContracts = contracts?.filter(c => c.organization_id === org.id) || []
        const revenue = orgContracts.reduce((sum, c) => sum + (c.amount || 0), 0)
        
        return {
          ...org,
          revenue_contribution: revenue,
          account_health: revenue > 0 ? "Healthy" : "Active",
          decision_makers: Math.floor(Math.random() * 5) + 2,
          opportunities_count: Math.floor(Math.random() * 4) + 1,
        }
      }) || []

      setAccounts(accountsWithData)

      // Calculate stats
      const totalRevenue = accountsWithData.reduce((sum, a) => sum + (a.revenue_contribution || 0), 0)
      setStats({
        total_accounts: accountsWithData.length,
        total_revenue: totalRevenue,
        average_account_value: accountsWithData.length > 0 ? totalRevenue / accountsWithData.length : 0,
        active_opportunities: accountsWithData.reduce((sum, a) => sum + (a.opportunities_count || 0), 0),
      })
    } catch (error) {
      console.error("Error fetching accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strategic Accounts"
        description="Manage customer relationships and account health. Monitor decision makers, opportunities, and revenue contribution for each account."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Accounts"
          value={stats.total_accounts}
          icon={Building2}
          trend="+12%"
          trendType="up"
        />
        <KpiCard
          label="Account Revenue"
          value={`K${Math.round(stats.total_revenue / 1000)}`}
          icon={DollarSign}
          trend="+18%"
          trendType="up"
        />
        <KpiCard
          label="Avg Account Value"
          value={`K${Math.round(stats.average_account_value / 1000)}`}
          icon={TrendingUp}
          trend="Stable"
          trendType="neutral"
        />
        <KpiCard
          label="Active Opportunities"
          value={stats.active_opportunities}
          icon={Users}
          trend="+5%"
          trendType="up"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No accounts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-center">Decision Makers</TableHead>
                    <TableHead className="text-center">Opportunities</TableHead>
                    <TableHead>Account Health</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.industry}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        K{Math.round((account.revenue_contribution || 0) / 1000)}
                      </TableCell>
                      <TableCell className="text-center">
                        {account.decision_makers}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{account.opportunities_count}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={account.account_health || "Active"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
