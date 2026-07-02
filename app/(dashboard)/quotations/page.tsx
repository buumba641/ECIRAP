import { FileText, Receipt } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getQuotations, getAccounts, getOpportunities } from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/format"
import { QuotationFormButton } from "@/components/forms/quotation-form"
import { StatusChanger } from "@/components/status-changer"
import { DeleteButton } from "@/components/delete-button"
import { updateQuotationStatus, deleteQuotation } from "@/lib/actions"

const STATUSES = ["Draft", "Sent", "Accepted", "Rejected", "Expired"]

export default async function QuotationsPage() {
  const [quotations, accounts, opportunities] = await Promise.all([
    getQuotations(),
    getAccounts(),
    getOpportunities(),
  ])

  const acctMap = new Map(accounts.map((a) => [a.id, a.name]))
  const oppMap = new Map(opportunities.map((o) => [o.id, o.name]))

  const totalValue = quotations.reduce(
    (s, q) => s + Number(q.total_amount),
    0,
  )
  const acceptedValue = quotations
    .filter((q) => q.status === "Accepted")
    .reduce((s, q) => s + Number(q.total_amount), 0)
  const pendingCount = quotations.filter(
    (q) => q.status === "Draft" || q.status === "Sent",
  ).length

  return (
    <div>
      <PageHeader
        title="Quotation Management"
        description="Track every quote from draft to accepted — maintain a clear audit trail from opportunity to contract."
      >
        <QuotationFormButton accounts={accounts} opportunities={opportunities} />
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Quotations</p>
            <p className="mt-1 text-xl font-semibold">{quotations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="mt-1 text-xl font-semibold">
              {formatCurrency(totalValue, true)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-chart-4/30 bg-chart-4/5">
          <CardContent>
            <p className="text-sm text-muted-foreground">Accepted Value</p>
            <p className="mt-1 text-xl font-semibold text-chart-4">
              {formatCurrency(acceptedValue, true)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="mt-1 text-xl font-semibold">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Opportunity</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No quotations yet. Click &quot;New Quotation&quot; to create one.
                  </TableCell>
                </TableRow>
              )}
              {quotations.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <p className="font-medium">{q.name}</p>
                    {q.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {q.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {q.account_id ? acctMap.get(q.account_id) ?? "—" : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {q.opportunity_id
                      ? oppMap.get(q.opportunity_id) ?? "—"
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(q.total_amount, true)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(q.valid_until)}
                  </TableCell>
                  <TableCell>
                    <StatusChanger
                      id={q.id}
                      currentStatus={q.status}
                      statuses={STATUSES}
                      action={updateQuotationStatus}
                    />
                  </TableCell>
                  <TableCell>
                    <DeleteButton id={q.id} action={deleteQuotation} />
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
