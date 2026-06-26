"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { supabase } from "@/lib/supabase/client"
import { FileText, CheckCircle, Clock, AlertCircle, DollarSign } from "lucide-react"

interface Contract {
  id: string
  name: string
  amount: number
  status: string
  signed_date?: string
  opportunity_id?: string
  created_at?: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_contracts: 0,
    signed_value: 0,
    pending_contracts: 0,
    contract_count_by_status: { Signed: 0, Pending: 0, Rejected: 0 },
  })

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      
      const { data: contractsData, error } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setContracts(contractsData || [])

      // Calculate stats
      const signed = contractsData?.filter(c => c.status === "Signed") || []
      const pending = contractsData?.filter(c => c.status === "Pending") || []
      const rejected = contractsData?.filter(c => c.status === "Rejected") || []

      const signedValue = signed.reduce((sum, c) => sum + (c.amount || 0), 0)
      const pendingValue = pending.reduce((sum, c) => sum + (c.amount || 0), 0)

      setStats({
        total_contracts: contractsData?.length || 0,
        signed_value: signedValue,
        pending_contracts: pending.length,
        contract_count_by_status: {
          Signed: signed.length,
          Pending: pending.length,
          Rejected: rejected.length,
        },
      })
    } catch (error) {
      console.error("Error fetching contracts:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contract Management"
        description="Monitor contract lifecycle, signed agreements, and pending approvals. Track contract value and renewal dates."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Contracts"
          value={stats.total_contracts}
          icon={FileText}
          trend="+8%"
          trendType="up"
        />
        <KpiCard
          label="Signed Value"
          value={`K${Math.round(stats.signed_value / 1000)}`}
          icon={CheckCircle}
          trend="+22%"
          trendType="up"
        />
        <KpiCard
          label="Pending Contracts"
          value={stats.pending_contracts}
          icon={Clock}
          trend="-3%"
          trendType="down"
        />
        <KpiCard
          label="Contract Health"
          value={`${Math.round((stats.contract_count_by_status.Signed / stats.total_contracts) * 100)}%`}
          icon={DollarSign}
          trend="On Track"
          trendType="neutral"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Signed Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contract_count_by_status.Signed}</div>
            <p className="text-xs text-muted-foreground mt-1">Agreements in effect</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.contract_count_by_status.Pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.contract_count_by_status.Rejected}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs revision</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading contracts...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No contracts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Name</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signed Date</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.name}</TableCell>
                      <TableCell className="text-right font-semibold">
                        K{Math.round((contract.amount || 0) / 1000)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={contract.status} />
                      </TableCell>
                      <TableCell>
                        {contract.signed_date
                          ? new Date(contract.signed_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {contract.created_at
                          ? new Date(contract.created_at).toLocaleDateString()
                          : "—"}
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
