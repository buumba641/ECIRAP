import { Wallet, TrendingUp, Target, Award } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueBarChart } from "@/components/charts"
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
  totalRevenue,
  totalBudget,
  revenueByCampaign,
  revenueByRegion,
  revenueByOwner,
} from "@/lib/data"
import { formatCurrency } from "@/lib/format"

export default async function RevenuePage() {
  const { campaigns, contracts, opportunities } = await getEnterpriseData()

  const revenue = totalRevenue(contracts)
  const budget = totalBudget(campaigns)
  const net = revenue - budget
  const roi = budget ? revenue / budget : 0

  const byCampaign = revenueByCampaign(campaigns, contracts)
  const byRegion = revenueByRegion(campaigns, contracts)
  const byOwner = revenueByOwner(opportunities)

  return (
    <div>
      <PageHeader
        title="Revenue & ROI Intelligence"
        description="Transform operational data into strategic insight — revenue by campaign, region and salesperson, with full ROI attribution."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(revenue, true)}
          icon={Wallet}
          trend={{ value: "+18.4%", positive: true }}
        />
        <KpiCard
          label="Marketing Spend"
          value={formatCurrency(budget, true)}
          icon={Target}
          hint="across all campaigns"
        />
        <KpiCard
          label="Net Return"
          value={formatCurrency(net, true)}
          icon={TrendingUp}
          trend={{ value: "+22.1%", positive: true }}
        />
        <KpiCard
          label="Blended ROI"
          value={`${roi.toFixed(1)}x`}
          icon={Award}
          hint="revenue per kwacha"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueBarChart data={byRegion} categoryKey="region" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Salesperson</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueBarChart data={byOwner} categoryKey="owner" />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Campaign ROI Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="text-right">ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byCampaign.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.channel}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(c.budget, true)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(c.revenue, true)}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${
                      c.net >= 0 ? "text-chart-4" : "text-destructive"
                    }`}
                  >
                    {formatCurrency(c.net, true)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-primary">
                    {c.roi.toFixed(1)}x
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
