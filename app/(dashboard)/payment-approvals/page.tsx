import {
  CheckSquare,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Info,
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
import { getQuotations, getAccounts } from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/format"
import { ApproveButton } from "./approve-button"

const STATUS_COLORS: Record<string, string> = {
  Draft: "border-muted-foreground/40 bg-muted text-muted-foreground",
  Sent: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  Accepted: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  Rejected: "border-destructive/40 bg-destructive/10 text-destructive",
  Expired: "border-muted-foreground/40 bg-muted text-muted-foreground",
}

export default async function PaymentApprovalsPage() {
  const [quotations, accounts] = await Promise.all([
    getQuotations(),
    getAccounts(),
  ])

  const acctMap = new Map(accounts.map((a) => [a.id, a.name]))

  // Items awaiting approval = Sent status
  const pending = quotations.filter((q) => q.status === "Sent")
  const approved = quotations.filter((q) => q.status === "Accepted")
  const rejected = quotations.filter((q) => q.status === "Rejected")

  const pendingValue = pending.reduce((s, q) => s + Number(q.total_amount), 0)

  return (
    <div>
      <PageHeader
        title="Payment Approvals"
        description="Review and sign off on quotations pending approval before release — your authorisation gate for high-value deals."
      />

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-chart-3/30 bg-chart-3/5 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Approval queue uses quotation status. </span>
          Quotations in <strong>Sent</strong> status require approval. A dedicated{" "}
          <code className="rounded bg-secondary px-1 text-xs">approved_by</code> field is planned
          for a future schema addition to track approver identity and timestamp.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Pending Approval"
          value={String(pending.length)}
          icon={Clock}
          trend={pending.length > 0 ? { value: "Action Required", positive: false } : { value: "Clear", positive: true }}
          hint={formatCurrency(pendingValue, true)}
        />
        <KpiCard
          label="Approved"
          value={String(approved.length)}
          icon={CheckCircle}
          hint={formatCurrency(approved.reduce((s, q) => s + Number(q.total_amount), 0), true)}
        />
        <KpiCard
          label="Rejected"
          value={String(rejected.length)}
          icon={XCircle}
        />
      </div>

      {/* Pending Approval Queue */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-chart-3" />
            Pending Approvals ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-52">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    No quotations pending approval.
                  </TableCell>
                </TableRow>
              )}
              {pending.map((q) => (
                <TableRow key={q.id} className="bg-chart-3/5">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{q.name}</p>
                        {q.notes && <p className="text-xs text-muted-foreground line-clamp-1">{q.notes}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {q.account_id ? acctMap.get(q.account_id) ?? "—" : "—"}
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {formatCurrency(q.total_amount, true)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(q.valid_until)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[q.status] ?? ""}>{q.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <ApproveButton id={q.id} currentStatus={q.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* All Quotations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            All Quotations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {q.account_id ? acctMap.get(q.account_id) ?? "—" : "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(q.total_amount, true)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(q.valid_until)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[q.status] ?? ""}>{q.status}</Badge>
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
