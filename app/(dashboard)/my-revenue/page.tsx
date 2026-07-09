import {
  Wallet,
  TrendingUp,
  Target,
  Trophy,
  CheckCircle,
  Clock,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RevenueBarChart } from "@/components/charts"
import {
  getEnterpriseData,
  revenueByOwner,
  wonOpps,
} from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/format"

export default async function MyRevenuePage() {
  const { opportunities, contracts, leads } = await getEnterpriseData()

  const byOwner = revenueByOwner(opportunities)
  const allWon = wonOpps(opportunities)

  // Summary stats using all data (scoped by owner_name in future iteration)
  const totalRev = contracts.reduce((s, c) => s + Number(c.amount), 0)
  const wonCount = allWon.length
  const openOpps = opportunities.filter(
    (o) => o.stage !== "Closed Won"
  )
  const openPipeline = openOpps.reduce((s, o) => s + Number(o.value), 0)

  // Today's won deals
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayWon = allWon.filter(
    (o) => o.created_at && o.created_at.slice(0, 10) === todayStr
  )
  const todayRevenue = todayWon.reduce((s, o) => s + Number(o.value), 0)

  // This month
  const monthStr = new Date().toISOString().slice(0, 7)
  const monthWon = allWon.filter(
    (o) => o.created_at && o.created_at.slice(0, 7) === monthStr
  )
  const monthRevenue = monthWon.reduce((s, o) => s + Number(o.value), 0)

  // Top 8 bar chart
  const chartData = byOwner.slice(0, 8)

  // My open pipeline (all reps shown — owner filter is future-ready)
  const topOpen = openOpps
    .sort((a, b) => Number(b.value) - Number(a.value))
    .slice(0, 6)

  return (
    <div>
      <PageHeader
        title="My Revenue"
        description="Your personal performance dashboard — track won deals, open pipeline, and revenue generated this period."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Revenue Won"
          value={formatCurrency(totalRev, true)}
          icon={Wallet}
          trend={{ value: "+18.4%", positive: true }}
          hint="vs last quarter"
        />
        <KpiCard
          label="Deals Closed"
          value={String(wonCount)}
          icon={Trophy}
          hint="all time"
        />
        <KpiCard
          label="Open Pipeline"
          value={formatCurrency(openPipeline, true)}
          icon={TrendingUp}
          hint={`${openOpps.length} opportunities`}
        />
        <KpiCard
          label="Conversion Rate"
          value={
            opportunities.length
              ? `${Math.round((wonCount / opportunities.length) * 100)}%`
              : "0%"
          }
          icon={Target}
          hint="win rate"
        />
      </div>

      {/* Today / This Period Split */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-chart-4/30 bg-chart-4/5">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-chart-4/20 text-chart-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Revenue</p>
              <p className="mt-0.5 text-2xl font-bold text-chart-4">
                {formatCurrency(todayRevenue, true)}
              </p>
              <p className="text-xs text-muted-foreground">
                {todayWon.length} deal{todayWon.length !== 1 ? "s" : ""} closed today
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="mt-0.5 text-2xl font-bold">
                {formatCurrency(monthRevenue, true)}
              </p>
              <p className="text-xs text-muted-foreground">
                {monthWon.length} deal{monthWon.length !== 1 ? "s" : ""} closed this month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Owner Bar */}
      {chartData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Revenue by Salesperson</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueBarChart data={chartData} categoryKey="owner" />
          </CardContent>
        </Card>
      )}

      {/* Open Pipeline Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Open Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Probability</TableHead>
                <TableHead>Expected Close</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topOpen.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No open opportunities.
                  </TableCell>
                </TableRow>
              )}
              {topOpen.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <p className="font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground">{o.grade} grade</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.owner ?? "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{o.stage}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(o.value, true)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-primary">
                    {o.probability}%
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(o.expected_close_date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
