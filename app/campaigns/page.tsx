import Link from "next/link"
import { ChevronRight, Megaphone } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import {
  getEnterpriseData,
  revenueByCampaign,
  totalRevenue,
  totalBudget,
} from "@/lib/data"
import { formatCurrency } from "@/lib/format"

export default async function CampaignsPage() {
  const { campaigns, contracts } = await getEnterpriseData()
  const rev = revenueByCampaign(campaigns, contracts)
  const revMap = new Map(rev.map((r) => [r.id, r]))

  const totalRev = totalRevenue(contracts)
  const totalBud = totalBudget(campaigns)

  return (
    <div>
      <PageHeader
        title="Campaign Management"
        description="Track marketing investment across every channel and follow it through to attributed revenue and ROI."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryStat label="Total Invested" value={formatCurrency(totalBud, true)} />
        <SummaryStat label="Attributed Revenue" value={formatCurrency(totalRev, true)} />
        <SummaryStat
          label="Blended ROI"
          value={`${totalBud ? (totalRev / totalBud).toFixed(1) : "0"}x`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {campaigns.map((c) => {
          const r = revMap.get(c.id)
          return (
            <Link key={c.id} href={`/campaigns/${c.id}`}>
              <Card className="group h-full transition-colors hover:border-primary/40">
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium leading-tight">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.channel} · {c.region}
                        </p>
                      </div>
                    </div>
                    <StatusBadge value={c.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
                    <Metric label="Budget" value={formatCurrency(c.budget, true)} />
                    <Metric
                      label="Revenue"
                      value={formatCurrency(r?.revenue ?? 0, true)}
                    />
                    <Metric
                      label="ROI"
                      value={`${(r?.roi ?? 0).toFixed(1)}x`}
                      accent
                    />
                  </div>

                  <div className="flex items-center justify-end text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View detail <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={accent ? "font-semibold text-primary" : "font-medium"}>
        {value}
      </p>
    </div>
  )
}
