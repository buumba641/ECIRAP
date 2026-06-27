import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getEnterpriseData,
  pipelineByStage,
  weightedPipeline,
  openPipelineValue,
} from "@/lib/data"
import { formatCurrency } from "@/lib/format"
import { ExportButtons } from "@/components/export-buttons"

const STAGES = ["Qualified", "Negotiation", "Closed Won"]

export default async function PipelinePage() {
  const { opportunities, campaigns } = await getEnterpriseData()
  const campMap = new Map(campaigns.map((c) => [c.id, c.name]))
  const byStage = pipelineByStage(opportunities)
  const weighted = weightedPipeline(opportunities)
  const open = openPipelineValue(opportunities)

  return (
    <div>
      <PageHeader
        title="Sales Pipeline & Forecasting"
        description="Every opportunity scored, weighted by win probability, and graded — producing an accurate revenue forecast."
      >
        <ExportButtons data={opportunities} />
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Open Pipeline</p>
            <p className="mt-1 text-xl font-semibold">
              {formatCurrency(open, true)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent>
            <p className="text-sm text-muted-foreground">Weighted Forecast</p>
            <p className="mt-1 text-xl font-semibold text-primary">
              {formatCurrency(weighted, true)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Open Opportunities</p>
            <p className="mt-1 text-xl font-semibold">
              {opportunities.filter((o) => o.stage !== "Closed Won").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban-style board */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {STAGES.map((stage) => {
          const stageData = byStage.find((s) => s.stage === stage)
          const opps = opportunities.filter((o) => o.stage === stage)
          return (
            <div key={stage} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold">{stage}</h3>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(stageData?.value ?? 0, true)} · {opps.length}
                </span>
              </div>
              {opps.map((o) => (
                <Card key={o.id}>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {o.name}
                      </p>
                      <StatusBadge value={o.grade} />
                    </div>
                    <p className="text-lg font-semibold">
                      {formatCurrency(o.value, true)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{o.owner}</span>
                      <span className="font-medium text-foreground">
                        {o.probability}% win
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {opps.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No opportunities
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right">Probability</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.campaign_id ? campMap.get(o.campaign_id) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.owner}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={o.grade} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {o.probability}%
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(o.value, true)}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge value={o.stage} />
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
