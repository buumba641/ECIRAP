import {
  Handshake,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock handover entries for shell demonstration
const MOCK_HANDOVERS = [
  { id: "1", cashier: "Bupe Lungu", submitted_at: "2026-07-09T18:00:00Z", amount: 15420, status: "Pending", notes: "End-of-day cash count" },
  { id: "2", cashier: "Bupe Lungu", submitted_at: "2026-07-08T18:05:00Z", amount: 22800, status: "Reconciled", notes: "End-of-day cash count" },
  { id: "3", cashier: "Bupe Lungu", submitted_at: "2026-07-07T17:55:00Z", amount: 18300, status: "Reconciled", notes: "End-of-day cash count" },
]

const STATUS_COLORS: Record<string, string> = {
  Pending: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  Reconciled: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  Disputed: "border-destructive/40 bg-destructive/10 text-destructive",
}

function formatCash(n: number) {
  return `ZMW ${n.toLocaleString("en-ZM", { minimumFractionDigits: 2 })}`
}

export default function CashHandoverPage() {
  const pending = MOCK_HANDOVERS.filter((h) => h.status === "Pending")
  const reconciled = MOCK_HANDOVERS.filter((h) => h.status === "Reconciled")
  const totalSubmitted = MOCK_HANDOVERS.reduce((s, h) => s + h.amount, 0)

  return (
    <div>
      <PageHeader
        title="Cash Handover Reconciliation"
        description="Submit and counter-sign end-of-shift cash counts. Both parties confirm before a handover is marked reconciled."
      />

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-chart-5/30 bg-chart-5/5 p-4">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-chart-5" />
        <div>
          <p className="text-sm font-medium text-foreground">Schema pending — showing demo data</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            A <code className="rounded bg-secondary px-1 text-xs">cash_handovers</code> table is required
            to persist real handover submissions with dual-signature reconciliation.
            The UI below shows the intended workflow.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Pending Reconciliation"
          value={String(pending.length)}
          icon={Clock}
          trend={pending.length > 0 ? { value: "Awaiting sign-off", positive: false } : { value: "All clear", positive: true }}
        />
        <KpiCard
          label="Reconciled Today"
          value={String(reconciled.length)}
          icon={CheckCircle}
          hint="verified & signed"
        />
        <KpiCard
          label="Total Submitted (ZMW)"
          value={`${totalSubmitted.toLocaleString("en-ZM")}`}
          icon={Handshake}
          hint="all sessions"
        />
      </div>

      {/* Pending handovers */}
      {pending.length > 0 && (
        <Card className="mt-6 border-chart-3/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-chart-3">
              <Clock className="h-4 w-4" />
              Awaiting Counter-Signature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pending.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-lg border border-border bg-chart-3/5 p-4">
                  <div>
                    <p className="font-medium">{h.cashier}</p>
                    <p className="text-sm text-muted-foreground">{h.notes}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {new Date(h.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCash(h.amount)}</p>
                    <Badge variant="outline" className={STATUS_COLORS[h.status]}>{h.status}</Badge>
                    <div className="mt-2 flex gap-2 justify-end">
                      <button className="rounded-md border border-chart-4/40 bg-chart-4/10 px-3 py-1 text-xs font-medium text-chart-4 hover:bg-chart-4/20 transition-colors">
                        Confirm ✓
                      </button>
                      <button className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors">
                        Dispute ✗
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-chart-4" />
            Handover History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MOCK_HANDOVERS.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${h.status === "Reconciled" ? "bg-chart-4/10 text-chart-4" : "bg-chart-3/10 text-chart-3"}`}>
                    {h.status === "Reconciled" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{h.cashier}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold">{formatCash(h.amount)}</p>
                  <Badge variant="outline" className={STATUS_COLORS[h.status]}>{h.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
