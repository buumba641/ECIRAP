import {
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  Users,
  FileText,
  Receipt,
  Sparkles,
  CheckCircle,
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
import {
  getFullEnterpriseData,
  getRevenueAlerts,
  detectLeakage,
} from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/format"
import { resolveAlert } from "@/lib/actions"
import { ResolveAlertButton } from "./resolve-button"

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "border-destructive/40 bg-destructive/10 text-destructive",
  High: "border-chart-5/40 bg-chart-5/10 text-chart-5",
  Medium: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  Low: "border-muted-foreground/40 bg-muted text-muted-foreground",
}

export default async function AssurancePage() {
  const [data, alerts] = await Promise.all([
    getFullEnterpriseData(),
    getRevenueAlerts(),
  ])

  const leakage = detectLeakage(data)
  const unresolvedAlerts = alerts.filter((a) => !a.resolved)

  return (
    <div>
      <PageHeader
        title="Revenue Assurance"
        description="Proactive detection of revenue leakage — unassigned leads, stalled deals, expiring contracts, and overdue invoices."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="At-Risk Value"
          value={formatCurrency(leakage.totalAtRiskValue, true)}
          icon={AlertTriangle}
          trend={
            leakage.totalAtRiskValue > 0
              ? { value: "Action Required", positive: false }
              : { value: "Clear", positive: true }
          }
        />
        <KpiCard
          label="Unassigned Leads"
          value={String(leakage.unassignedLeads.length)}
          icon={Users}
          hint="leads without an owner"
        />
        <KpiCard
          label="Stalled Opportunities"
          value={String(leakage.stalledOpps.length)}
          icon={TrendingDown}
          hint="qualified > 30 days"
        />
        <KpiCard
          label="Overdue Invoices"
          value={String(leakage.overdueInvoices.length)}
          icon={Receipt}
          hint="past due date"
        />
      </div>

      {/* Contract Renewal Warnings */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className={leakage.expiring30.length > 0 ? "border-destructive/30" : ""}>
          <CardContent>
            <p className="text-sm text-muted-foreground">Expiring in 30 days</p>
            <p className="mt-1 text-2xl font-bold">
              {leakage.expiring30.length}
            </p>
            {leakage.expiring30.length > 0 && (
              <div className="mt-2 space-y-1">
                {leakage.expiring30.slice(0, 3).map((c) => (
                  <p key={c.id} className="text-xs text-muted-foreground truncate">
                    {c.name} — {formatDate(c.end_date)}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Expiring in 60 days</p>
            <p className="mt-1 text-2xl font-bold">
              {leakage.expiring60.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Expiring in 90 days</p>
            <p className="mt-1 text-2xl font-bold">
              {leakage.expiring90.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stalled Leads */}
      {leakage.stalledLeads.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-chart-5">
              <Users className="h-4 w-4" /> Stalled Leads ({leakage.stalledLeads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leakage.stalledLeads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-muted-foreground">{l.company ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{l.owner ?? "Unassigned"}</TableCell>
                    <TableCell className="tabular-nums">{l.score}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(l.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Stalled Opportunities */}
      {leakage.stalledOpps.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-chart-5">
              <TrendingDown className="h-4 w-4" /> Stalled Opportunities ({leakage.stalledOpps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leakage.stalledOpps.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell className="text-muted-foreground">{o.owner ?? "—"}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(o.value, true)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{o.stage}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(o.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Overdue Invoices */}
      {leakage.overdueInvoices.length > 0 && (
        <Card className="mt-6 border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Receipt className="h-4 w-4" /> Overdue Invoices ({leakage.overdueInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leakage.overdueInvoices.map((i) => (
                  <TableRow key={i.id} className="bg-destructive/5">
                    <TableCell className="font-medium">
                      {i.invoice_number ?? i.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(i.amount, true)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(i.paid_amount, true)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      {formatCurrency(Number(i.amount) - Number(i.paid_amount), true)}
                    </TableCell>
                    <TableCell className="font-medium text-destructive">
                      {formatDate(i.due_date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Revenue Alerts */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Revenue Alerts ({unresolvedAlerts.length} unresolved)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unresolvedAlerts.length === 0 && alerts.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No revenue alerts. The system is continuously monitoring for leakage.
            </p>
          )}
          {unresolvedAlerts.length === 0 && alerts.length > 0 && (
            <div className="flex items-center gap-2 rounded-md bg-chart-4/10 p-4 text-sm text-chart-4">
              <CheckCircle className="h-4 w-4" />
              All alerts resolved. Great job!
            </div>
          )}
          <div className="space-y-3">
            {unresolvedAlerts.map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-chart-5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{a.title}</p>
                      <Badge
                        variant="outline"
                        className={SEVERITY_COLORS[a.severity] ?? ""}
                      >
                        {a.severity}
                      </Badge>
                    </div>
                    {a.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {a.description}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground/60">
                      {a.type} · {formatDate(a.created_at)}
                    </p>
                  </div>
                </div>
                <ResolveAlertButton id={a.id} />
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <div className="mt-4 rounded-md border border-border bg-secondary/50 p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI Revenue Protection Insight
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {leakage.totalAtRiskValue > 0
                ? `There is ${formatCurrency(leakage.totalAtRiskValue, true)} of revenue at risk. Focus on resolving ${leakage.overdueInvoices.length} overdue invoices and re-engaging ${leakage.stalledOpps.length} stalled opportunities to protect your pipeline.`
                : "Revenue assurance metrics look healthy. Continue monitoring for early warning signs of leakage across the commercial pipeline."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
