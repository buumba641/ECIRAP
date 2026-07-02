import Link from "next/link"
import { ChevronRight, Building2, Heart, Crown } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  getAccounts,
  getIndustries,
  getBranches,
  accountsByTier,
  totalAccountRevenue,
  averageHealthScore,
} from "@/lib/data"
import { formatCurrency, formatNumber } from "@/lib/format"
import { AccountFormButton } from "@/components/forms/account-form"

const TIER_COLORS: Record<string, string> = {
  Platinum: "border-chart-1/40 bg-chart-1/10 text-chart-1",
  Gold: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  Silver: "border-muted-foreground/40 bg-muted text-muted-foreground",
  Bronze: "border-chart-5/40 bg-chart-5/10 text-chart-5",
}

export default async function AccountsPage() {
  const [accounts, industries, branches] = await Promise.all([
    getAccounts(),
    getIndustries(),
    getBranches(),
  ])

  const byTier = accountsByTier(accounts)
  const totalRev = totalAccountRevenue(accounts)
  const avgHealth = averageHealthScore(accounts)

  return (
    <div>
      <PageHeader
        title="Strategic Accounts"
        description="360° visibility into every key account — tier, health score, revenue, and activity at a glance."
      >
        <AccountFormButton industries={industries} branches={branches} />
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Accounts"
          value={formatNumber(accounts.length)}
          icon={Building2}
          hint={`${byTier.find((t) => t.tier === "Platinum")?.count ?? 0} Platinum`}
        />
        <KpiCard
          label="Account Revenue"
          value={formatCurrency(totalRev, true)}
          icon={Crown}
          hint="annual revenue"
        />
        <KpiCard
          label="Avg Health Score"
          value={`${avgHealth}/100`}
          icon={Heart}
          trend={avgHealth >= 70 ? { value: "Healthy", positive: true } : { value: "At Risk", positive: false }}
        />
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">By Tier</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {byTier.map((t) => (
                <Badge key={t.tier} variant="outline" className={TIER_COLORS[t.tier]}>
                  {t.tier}: {t.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {accounts.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No accounts yet. Click &quot;New Account&quot; to create your first strategic account.
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => (
          <Link key={a.id} href={`/accounts/${a.id}`}>
            <Card className="group h-full transition-colors hover:border-primary/40">
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium leading-tight">{a.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.province ?? "—"} · {a.email ?? "No email"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={TIER_COLORS[a.tier]}>
                    {a.tier}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Health Score</span>
                    <span className="font-medium tabular-nums">{a.health_score}/100</span>
                  </div>
                  <Progress
                    value={a.health_score}
                    className={`h-1.5 ${
                      a.health_score >= 70
                        ? "[&>[data-slot=indicator]]:bg-chart-4"
                        : a.health_score >= 40
                          ? "[&>[data-slot=indicator]]:bg-chart-3"
                          : "[&>[data-slot=indicator]]:bg-destructive"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <p className="text-sm font-semibold">
                    {formatCurrency(a.annual_revenue, true)}
                  </p>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View 360° <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
