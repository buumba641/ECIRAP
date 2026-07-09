import {
  GitPullRequest,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent } from "@/components/ui/card"
import { ChangeRequestClient } from "./change-request-client"

export default function ChangeRequestsPage() {
  return (
    <div>
      <PageHeader
        title="Change Requests"
        description="Propose config changes, deployments, or infrastructure updates. Submitted requests sit pending until CEO approves."
      />

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-chart-5/30 bg-chart-5/5 p-4">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-chart-5" />
        <div>
          <p className="text-sm font-medium text-foreground">Schema pending — client-side only</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            A <code className="rounded bg-secondary px-1 text-xs">change_requests</code> table is needed to
            persist requests across sessions. Submissions currently reset on page refresh.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <KpiCard label="Pending Approval" value="1" icon={Clock} trend={{ value: "Awaiting CEO", positive: false }} />
        <KpiCard label="Approved" value="1" icon={CheckCircle} trend={{ value: "Cleared", positive: true }} />
        <KpiCard label="Total Submitted" value="2" icon={GitPullRequest} hint="all time" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <ChangeRequestClient />
        </CardContent>
      </Card>
    </div>
  )
}
