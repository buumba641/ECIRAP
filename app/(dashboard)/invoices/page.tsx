import { Receipt, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent } from "@/components/ui/card"
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
  getInvoices,
  getAccounts,
  getContracts,
  totalInvoiced,
  totalPaid,
  overdueInvoices,
} from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/format"
import { InvoiceFormButton } from "@/components/forms/invoice-form"
import { StatusChanger } from "@/components/status-changer"
import { DeleteButton } from "@/components/delete-button"
import { updateInvoiceStatus, deleteInvoice } from "@/lib/actions"

const STATUSES = ["Pending", "Partial", "Paid", "Overdue", "Cancelled"]

export default async function InvoicesPage() {
  const [invoices, accounts, contracts] = await Promise.all([
    getInvoices(),
    getAccounts(),
    getContracts(),
  ])

  const acctMap = new Map(accounts.map((a) => [a.id, a.name]))
  const ctMap = new Map(contracts.map((c) => [c.id, c.name]))

  const invoiced = totalInvoiced(invoices)
  const paid = totalPaid(invoices)
  const overdue = overdueInvoices(invoices)
  const overdueValue = overdue.reduce(
    (s, i) => s + Number(i.amount) - Number(i.paid_amount),
    0,
  )
  const collectionRate = invoiced ? (paid / invoiced) * 100 : 0

  return (
    <div>
      <PageHeader
        title="Invoice Management"
        description="End-to-end invoice tracking — from issuance through payment, with overdue detection for revenue assurance."
      >
        <InvoiceFormButton accounts={accounts} contracts={contracts} />
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Invoiced"
          value={formatCurrency(invoiced, true)}
          icon={Receipt}
          hint={`${invoices.length} invoices`}
        />
        <KpiCard
          label="Total Collected"
          value={formatCurrency(paid, true)}
          icon={CheckCircle}
          trend={{ value: `${collectionRate.toFixed(0)}%`, positive: collectionRate >= 80 }}
          hint="collection rate"
        />
        <KpiCard
          label="Outstanding"
          value={formatCurrency(invoiced - paid, true)}
          icon={Clock}
        />
        <KpiCard
          label="Overdue"
          value={formatCurrency(overdueValue, true)}
          icon={AlertTriangle}
          trend={
            overdue.length > 0
              ? { value: `${overdue.length} overdue`, positive: false }
              : { value: "None", positive: true }
          }
        />
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No invoices yet. Click &quot;New Invoice&quot; to create one.
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((i) => {
                const isOverdue =
                  (i.status === "Pending" || i.status === "Partial") &&
                  i.due_date &&
                  new Date(i.due_date) < new Date()
                return (
                  <TableRow
                    key={i.id}
                    className={isOverdue ? "bg-destructive/5" : ""}
                  >
                    <TableCell>
                      <p className="font-medium">
                        {i.invoice_number ?? i.id.slice(0, 8)}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {i.account_id ? acctMap.get(i.account_id) ?? "—" : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {i.contract_id ? ctMap.get(i.contract_id) ?? "—" : "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(i.amount, true)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(i.paid_amount, true)}
                    </TableCell>
                    <TableCell
                      className={
                        isOverdue
                          ? "font-medium text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {formatDate(i.due_date)}
                      {isOverdue && " ⚠"}
                    </TableCell>
                    <TableCell>
                      <StatusChanger
                        id={i.id}
                        currentStatus={i.status}
                        statuses={STATUSES}
                        action={updateInvoiceStatus}
                      />
                    </TableCell>
                    <TableCell>
                      <DeleteButton id={i.id} action={deleteInvoice} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
