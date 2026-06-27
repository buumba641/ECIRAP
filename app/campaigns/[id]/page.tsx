import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Sparkles } from "lucide-react"
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
import { CampaignTimeline } from "@/components/campaign-timeline"
import { getEnterpriseData } from "@/lib/data"
import { formatCurrency, formatDate, formatPercent } from "@/lib/format"

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { campaigns, leads, opportunities, contracts } =
    await getEnterpriseData()

  const campaign = campaigns.find((c) => c.id === id)
  if (!campaign) notFound()

  const campLeads = leads.filter((l) => l.campaign_id === id)
  const campOpps = opportunities.filter((o) => o.campaign_id === id)
  const campContracts = contracts.filter((ct) => ct.campaign_id === id)

  const revenue = campContracts.reduce((s, c) => s + Number(c.amount), 0)
  const roi = campaign.budget ? revenue / campaign.budget : 0
  const net = revenue - campaign.budget
  const converted = campLeads.filter((l) => l.status === "Converted").length
  const convRate = campLeads.length
    ? (converted / campLeads.length) * 100
    : 0

  const milestones = [
    { name: "Campaign Launched", date: campaign.start_date || campaign.created_at, status: "Completed" as const },
    { name: "First Lead Generated", date: campLeads[campLeads.length - 1]?.created_at || new Date().toISOString(), status: campLeads.length > 0 ? "Completed" as const : "Pending" as const },
    { name: "First Customer Converted", date: campOpps.find(o => o.stage === "Closed Won")?.created_at || new Date().toISOString(), status: converted > 0 ? "Completed" as const : "Pending" as const },
  ]

  let cumulative = 0;
  const revenueData = campContracts
    .filter(c => c.signed_date)
    .sort((a, b) => new Date(a.signed_date!).getTime() - new Date(b.signed_date!).getTime())
    .map(c => {
      cumulative += Number(c.amount)
      return {
        date: c.signed_date!.substring(0, 10),
        revenue: Number(c.amount),
        cumulative
      }
    })

  return (
    <div>
      <Link
        href="/campaigns"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to campaigns
      </Link>

      <PageHeader title={campaign.name} description={campaign.objective ?? undefined}>
        <StatusBadge value={campaign.status} />
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Budget" value={formatCurrency(campaign.budget, true)} />
        <Stat label="Revenue" value={formatCurrency(revenue, true)} />
        <Stat
          label="ROI"
          value={`${roi.toFixed(1)}x`}
          accent
        />
        <Stat
          label="Net Return"
          value={formatCurrency(net, true)}
          accent={net >= 0}
        />
      </div>

      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">AI Insight</p>
            <p className="mt-0.5 text-sm leading-relaxed text-foreground/80">
              This {campaign.channel} campaign converted{" "}
              {formatPercent(convRate)} of {campLeads.length} leads into a{" "}
              {roi.toFixed(1)}x return. {net >= 0 ? "Consider scaling budget" : "Review targeting"}{" "}
              and replicate the playbook across the {campaign.region} region.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Funnel mini-stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Funnel label="Leads" value={campLeads.length} />
        <Funnel label="Opportunities" value={campOpps.length} />
        <Funnel
          label="Won Deals"
          value={campOpps.filter((o) => o.stage === "Closed Won").length}
        />
        <Funnel label="Conversion" value={formatPercent(convRate)} />
      </div>

      <div className="mb-6">
        <CampaignTimeline
          campaignName={campaign.name}
          startDate={campaign.start_date || campaign.created_at}
          endDate={campaign.end_date || new Date().toISOString()}
          milestones={milestones}
          revenueData={revenueData}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads ({campLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campLeads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {l.company}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge value={l.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {campLeads.length === 0 && <EmptyRow span={3} />}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opportunities ({campOpps.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campOpps.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(o.value, true)}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge value={o.stage} />
                    </TableCell>
                  </TableRow>
                ))}
                {campOpps.length === 0 && <EmptyRow span={3} />}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Signed Contracts ({campContracts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Signed</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campContracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(c.signed_date)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(c.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge value={c.status} />
                  </TableCell>
                </TableRow>
              ))}
              {campContracts.length === 0 && <EmptyRow span={4} />}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p
          className={`mt-1 text-xl font-semibold ${accent ? "text-primary" : ""}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function Funnel({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function EmptyRow({ span }: { span: number }) {
  return (
    <TableRow>
      <TableCell
        colSpan={span}
        className="py-6 text-center text-sm text-muted-foreground"
      >
        No records yet.
      </TableCell>
    </TableRow>
  )
}
