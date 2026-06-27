import Link from "next/link"
import {
  Wallet,
  TrendingUp,
  Target,
  Users,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  RevenueBarChart,
  PipelineBarChart,
  LeadStatusChart,
} from "@/components/charts"
import {
  getEnterpriseData,
  totalRevenue,
  totalBudget,
  weightedPipeline,
  conversionRate,
  revenueByCampaign,
  pipelineByStage,
  leadsByStatus,
  wonOpps,
} from "@/lib/data"
import { formatCurrency, formatPercent, formatNumber } from "@/lib/format"

export default async function DashboardPage() {
  const { campaigns, leads, opportunities, contracts } =
    await getEnterpriseData()

  const revenue = totalRevenue(contracts)
  const budget = totalBudget(campaigns)
  const pipeline = weightedPipeline(opportunities)
  const blendedRoi = budget ? revenue / budget : 0

  const byCampaign = revenueByCampaign(campaigns, contracts).slice(0, 6)
  const byStage = pipelineByStage(opportunities)
  const byStatus = leadsByStatus(leads)

  const topOpps = [...opportunities]
    .filter((o) => o.stage !== "Closed Won")
    .sort((a, b) => b.value - a.value)
    .slice(0, 4)

  const recentContracts = [...contracts]
    .filter((c) => c.status === "Signed" || c.status === "Active")
    .sort((a, b) => new Date(b.signed_date || b.created_at).getTime() - new Date(a.signed_date || a.created_at).getTime())
    .slice(0, 4)

  const unassignedLeads = leads.filter((l) => !l.owner).length
  const stalledOpps = opportunities.filter(
    (o) => o.stage === "Qualified" && o.probability < 50,
  ).length
  const expiringCampaigns = campaigns.filter(
    (c) =>
      c.status === "Active" &&
      c.end_date &&
      new Date(c.end_date) < new Date(Date.now() + 30 * 864e5),
  ).length

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        description="Complete visibility into the commercial process — pipeline, revenue, performance and revenue assurance, in one view."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Revenue (Won)"
          value={formatCurrency(revenue, true)}
          icon={Wallet}
          trend={{ value: "+18.4%", positive: true }}
          hint="vs last quarter"
        />
        <KpiCard
          label="Weighted Pipeline"
          value={formatCurrency(pipeline, true)}
          icon={TrendingUp}
          hint={`${formatNumber(
            opportunities.filter((o) => o.stage !== "Closed Won").length,
          )} open opportunities`}
        />
        <KpiCard
          label="Blended ROI"
          value={`${blendedRoi.toFixed(1)}x`}
          icon={Target}
          trend={{ value: "+0.6x", positive: true }}
          hint={`${formatCurrency(budget, true)} invested`}
        />
        <KpiCard
          label="Lead Conversion"
          value={formatPercent(conversionRate(leads))}
          icon={Users}
          hint={`${wonOpps(opportunities).length} deals won`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueBarChart data={byCampaign} categoryKey="name" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadStatusChart data={byStatus} />
            <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              {byStatus.map((s) => (
                <span key={s.status} className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">{s.count}</span>
                  {s.status}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Pipeline by Stage</CardTitle>
            <Link
              href="/pipeline"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary"
            >
              View pipeline <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <PipelineBarChart data={byStage} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-chart-5" />
            <CardTitle>Revenue Assurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <LeakRow
              label="Unassigned leads"
              value={unassignedLeads}
              tone={unassignedLeads ? "warn" : "ok"}
            />
            <LeakRow
              label="Stalled opportunities"
              value={stalledOpps}
              tone={stalledOpps ? "warn" : "ok"}
            />
            <LeakRow
              label="Campaigns expiring < 30d"
              value={expiringCampaigns}
              tone={expiringCampaigns ? "warn" : "ok"}
            />
            <div className="rounded-md border border-border bg-secondary/50 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI Recommended Action
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Accelerate the Madison Group Cloud deal and re-engage stalled
                opportunities to protect {formatCurrency(260000, true)} of
                at-risk pipeline before quarter close.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Top Open Opportunities</CardTitle>
            <Link
              href="/pipeline"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary"
            >
              All opportunities <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {topOpps.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.owner} · {o.stage}
                  </p>
                </div>
                <div className="ml-3 text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(o.value, true)}
                  </p>
                  <Badge variant="secondary" className="mt-0.5 text-[10px]">
                    {o.probability}% · {o.grade}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Revenue Events (Invoices)</CardTitle>
            <Link
              href="/contracts"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary"
            >
              All revenue events <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentContracts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:border-primary/40 cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    INV-{c.id.substring(0,6).toUpperCase()} · {new Date(c.signed_date || c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-3 text-right">
                  <p className="text-sm font-semibold text-green-600">
                    +{formatCurrency(c.amount, true)}
                  </p>
                  <Badge variant="outline" className="mt-0.5 text-[10px]">
                    {c.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LeakRow({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "ok" | "warn"
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Badge
        variant="outline"
        className={
          tone === "warn"
            ? "border-chart-5/40 bg-chart-5/10 text-chart-5"
            : "border-chart-4/40 bg-chart-4/10 text-chart-4"
        }
      >
        {value}
      </Badge>
    </div>
  )
}
