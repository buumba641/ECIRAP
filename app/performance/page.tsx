"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase/client"
import { UserCheck, Award, TrendingUp, Target } from "lucide-react"

interface EmployeePerformance {
  owner: string
  total_leads: number
  converted_leads: number
  opportunities_owned: number
  total_value: number
  closed_deals: number
  conversion_rate: number
  average_deal_size: number
  performance_score: number
}

export default function PerformancePage() {
  const [employees, setEmployees] = useState<EmployeePerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_employees: 0,
    top_performer: "",
    team_conversion_rate: 0,
    total_pipeline_value: 0,
  })

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)

      // Fetch opportunities and leads with owner info
      const { data: opportunities } = await supabase
        .from("opportunities")
        .select("*, leads(*)")

      const { data: contracts } = await supabase
        .from("contracts")
        .select("*, opportunities(*)")

      // Group by owner/salesperson
      const performanceMap: Record<string, EmployeePerformance> = {}

      // Process opportunities
      opportunities?.forEach(opp => {
        const owner = opp.owner || "Unassigned"
        if (!performanceMap[owner]) {
          performanceMap[owner] = {
            owner,
            total_leads: 0,
            converted_leads: 0,
            opportunities_owned: 0,
            total_value: 0,
            closed_deals: 0,
            conversion_rate: 0,
            average_deal_size: 0,
            performance_score: 0,
          }
        }

        performanceMap[owner].opportunities_owned += 1
        performanceMap[owner].total_value += opp.value || 0

        if (opp.stage === "Closed Won") {
          performanceMap[owner].closed_deals += 1
          performanceMap[owner].converted_leads += 1
        }
      })

      // Process leads
      const { data: leads } = await supabase.from("leads").select("*")
      leads?.forEach(lead => {
        const owner = lead.owner || "Unassigned"
        if (!performanceMap[owner]) {
          performanceMap[owner] = {
            owner,
            total_leads: 0,
            converted_leads: 0,
            opportunities_owned: 0,
            total_value: 0,
            closed_deals: 0,
            conversion_rate: 0,
            average_deal_size: 0,
            performance_score: 0,
          }
        }
        performanceMap[owner].total_leads += 1
        if (lead.status === "Converted") {
          performanceMap[owner].converted_leads += 1
        }
      })

      // Calculate metrics
      const employeeList = Object.values(performanceMap).map(emp => {
        const conversionRate = emp.total_leads > 0 ? (emp.converted_leads / emp.total_leads) * 100 : 0
        const avgDealSize = emp.closed_deals > 0 ? emp.total_value / emp.closed_deals : 0
        const performanceScore = Math.min(
          100,
          (conversionRate * 0.4 + (emp.closed_deals / Math.max(1, emp.opportunities_owned)) * 100 * 0.4 + (Math.min(emp.total_value / 500000, 1)) * 100 * 0.2)
        )

        return {
          ...emp,
          conversion_rate: conversionRate,
          average_deal_size: avgDealSize,
          performance_score: performanceScore,
        }
      }).sort((a, b) => b.performance_score - a.performance_score)

      setEmployees(employeeList)

      // Calculate team stats
      const totalLeads = employeeList.reduce((sum, e) => sum + e.total_leads, 0)
      const totalConverted = employeeList.reduce((sum, e) => sum + e.converted_leads, 0)
      const totalPipelineValue = employeeList.reduce((sum, e) => sum + e.total_value, 0)

      setStats({
        total_employees: employeeList.filter(e => e.owner !== "Unassigned").length,
        top_performer: employeeList[0]?.owner || "—",
        team_conversion_rate: totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0,
        total_pipeline_value: totalPipelineValue,
      })
    } catch (error) {
      console.error("Error fetching performance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-blue-600"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Performance"
        description="Track sales team productivity, conversion rates, and deal quality. Monitor individual performance against targets."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Active Employees"
          value={stats.total_employees}
          icon={UserCheck}
          trend="+3%"
          trendType="up"
        />
        <KpiCard
          label="Top Performer"
          value={stats.top_performer === "—" ? "—" : stats.top_performer.split(" ")[0]}
          icon={Award}
          trend="Leading"
          trendType="neutral"
        />
        <KpiCard
          label="Team Conversion"
          value={`${Math.round(stats.team_conversion_rate)}%`}
          icon={TrendingUp}
          trend="+5%"
          trendType="up"
        />
        <KpiCard
          label="Pipeline Value"
          value={`K${Math.round(stats.total_pipeline_value / 1000)}`}
          icon={Target}
          trend="+22%"
          trendType="up"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading performance data...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No employee data found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {employees.map((employee, index) => (
                <div key={employee.owner} className="border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <h3 className="font-semibold">{employee.owner}</h3>
                        <Badge variant={employee.performance_score >= 80 ? "default" : "secondary"}>
                          {employee.closed_deals} Deals
                        </Badge>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${getPerformanceColor(employee.performance_score)}`}>
                      {Math.round(employee.performance_score)}%
                    </span>
                  </div>

                  <Progress value={employee.performance_score} className="mb-2" />

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Leads</p>
                      <p className="font-semibold">{employee.total_leads}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversion</p>
                      <p className="font-semibold">{Math.round(employee.conversion_rate)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Opportunities</p>
                      <p className="font-semibold">{employee.opportunities_owned}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Deal Size</p>
                      <p className="font-semibold">K{Math.round((employee.average_deal_size || 0) / 1000)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-center">Leads</TableHead>
                    <TableHead className="text-center">Conversion</TableHead>
                    <TableHead className="text-center">Closed Deals</TableHead>
                    <TableHead className="text-right">Pipeline Value</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee, index) => (
                    <TableRow key={employee.owner}>
                      <TableCell className="font-semibold">#{index + 1}</TableCell>
                      <TableCell className="font-medium">{employee.owner}</TableCell>
                      <TableCell className="text-center">{employee.total_leads}</TableCell>
                      <TableCell className="text-center">{Math.round(employee.conversion_rate)}%</TableCell>
                      <TableCell className="text-center">{employee.closed_deals}</TableCell>
                      <TableCell className="text-right font-semibold">
                        K{Math.round((employee.total_value || 0) / 1000)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={employee.performance_score >= 80 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                          {Math.round(employee.performance_score)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
