import {
  BarChart2,
  Trophy,
  TrendingUp,
  Users,
  Info,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { formatCurrency, formatPercent, formatNumber } from "@/lib/format"

export default async function TeamPerformancePage() {
  const { opportunities } = await getEnterpriseData()

  const byOwner = revenueByOwner(opportunities)
  const won = wonOpps(opportunities)
  const totalRevenue = byOwner.reduce((s, r) => s + r.revenue, 0)
  const topRep = byOwner[0] ?? null

  const repStats = byOwner.map((r) => {
    const repOpps = opportunities.filter((o) => o.owner === r.owner)
    const repWon = repOpps.filter((o) => o.stage === "Closed Won")
    const repOpen = repOpps.filter((o) => o.stage !== "Closed Won")
    const winRate = repOpps.length ? (repWon.length / repOpps.length) * 100 : 0
    const pipelineValue = repOpen.reduce((s, o) => s + Number(o.value), 0)
    return {
      owner: r.owner,
      revenue: r.revenue,
      wonCount: repWon.length,
      openCount: repOpen.length,
      pipelineValue,
      winRate,
      revenueShare: totalRevenue ? (r.revenue / totalRevenue) * 100 : 0,
    }
  })

  const chartData = byOwner.slice(0, 10)

  return (
    <div>
      <PageHeader
        title="Team Performance"
        description="Sales rep comparison — revenue won, pipeline value, and win rate across the team."
      />

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-chart-3/30 bg-chart-3/5 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Showing all reps. </span>
          Team-scoping requires a{" "}
          <code className="rounded bg-secondary px-1 text-xs">team_members</code> table
          planned for a future schema addition.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Team Revenue"
          value={formatCurrency(totalRevenue, true)}
          icon={Trophy}
          trend={{ value: "+18.4%", positive: true }}
        />
        <KpiCard
          label="Reps Tracked"
          value={formatNumber(byOwner.length)}
          icon={Users}
          hint="with closed deals"
        />
        <KpiCard
          label="Total Deals Won"
          value={formatNumber(won.length)}
          icon={TrendingUp}
        />
        <KpiCard
          label="Top Performer"
          value={topRep?.owner ?? "—"}
          icon={BarChart2}
          hint={topRep ? formatCurrency(topRep.revenue, true) : ""}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Revenue by Rep</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No revenue data yet.</p>
          ) : (
            <RevenueBarChart data={chartData} categoryKey="owner" />
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Rep Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rep</TableHead>
                <TableHead className="text-right">Revenue Won</TableHead>
                <TableHead className="text-right">Deals Won</TableHead>
                <TableHead className="text-right">Open Pipeline</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="w-40">Revenue Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repStats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No performance data available yet.
                  </TableCell>
                </TableRow>
              )}
              {repStats.map((rep, idx) => (
                <TableRow key={rep.owner}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {idx + 1}
                      </div>
                      <p className="font-medium">{rep.owner}</p>
                      {idx === 0 && (
                        <Badge variant="outline" className="border-chart-3/40 bg-chart-3/10 text-chart-3 text-[10px]">Top</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(rep.revenue, true)}</TableCell>
                  <TableCell className="text-right tabular-nums">{rep.wonCount}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency(rep.pipelineValue, true)}</TableCell>
                  <TableCell className="text-right">
                    <span className={rep.winRate >= 50 ? "font-medium text-chart-4" : rep.winRate >= 25 ? "font-medium text-chart-3" : "text-destructive"}>
                      {formatPercent(rep.winRate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={rep.revenueShare} className="h-1.5 flex-1" />
                      <span className="w-10 text-right text-xs font-medium tabular-nums text-muted-foreground">
                        {rep.revenueShare.toFixed(0)}%
                      </span>
                    </div>
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
