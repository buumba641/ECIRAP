import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  ArrowLeft,
  Users,
  FileText,
  Receipt,
  Activity as ActivityIcon,
  TrendingUp,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAccountData } from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/format"
import { ContactFormButton } from "@/components/forms/contact-form"
import { ActivityFormButton } from "@/components/forms/activity-form"
import { DeleteButton } from "@/components/delete-button"
import { deleteContact, deleteActivity } from "@/lib/actions"

const TIER_COLORS: Record<string, string> = {
  Platinum: "border-chart-1/40 bg-chart-1/10 text-chart-1",
  Gold: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  Silver: "border-muted-foreground/40 bg-muted text-muted-foreground",
  Bronze: "border-chart-5/40 bg-chart-5/10 text-chart-5",
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const {
    account,
    contacts,
    opportunities,
    contracts,
    quotations,
    invoices,
    activities,
  } = await getAccountData(id)

  if (!account) notFound()

  const totalContractValue = contracts.reduce(
    (s, c) => s + Number(c.amount),
    0,
  )
  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.amount), 0)
  const totalPaid = invoices.reduce((s, i) => s + Number(i.paid_amount), 0)

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/accounts"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Accounts
        </Link>
      </div>

      <PageHeader
        title={account.name}
        description="360° account view — contacts, pipeline, contracts, invoices, and activity timeline."
      >
        <Badge variant="outline" className={TIER_COLORS[account.tier]}>
          {account.tier}
        </Badge>
      </PageHeader>

      {/* Account Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Health Score</p>
            <p className="mt-1 text-xl font-semibold">{account.health_score}/100</p>
            <Progress value={account.health_score} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Annual Revenue</p>
            <p className="mt-1 text-xl font-semibold">
              {formatCurrency(account.annual_revenue, true)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Contract Value</p>
            <p className="mt-1 text-xl font-semibold">
              {formatCurrency(totalContractValue, true)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Invoiced / Paid</p>
            <p className="mt-1 text-xl font-semibold">
              {formatCurrency(totalPaid, true)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {formatCurrency(totalInvoiced, true)}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Details Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {account.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{account.email}</span>
              </div>
            )}
            {account.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{account.phone}</span>
              </div>
            )}
            {account.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{account.website}</span>
              </div>
            )}
            {account.province && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{account.province}</span>
              </div>
            )}
          </div>
          {account.notes && (
            <p className="mt-3 rounded-md bg-secondary/50 p-3 text-sm text-muted-foreground">
              {account.notes}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Contacts ({contacts.length})
          </CardTitle>
          <ContactFormButton accountId={id} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No contacts yet.
                  </TableCell>
                </TableRow>
              )}
              {contacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {c.first_name} {c.last_name}
                      </span>
                      {c.is_primary && (
                        <Badge variant="outline" className="text-[10px]">
                          Primary
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.job_title ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={c.role} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    <DeleteButton id={c.id} action={deleteContact} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Opportunities */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Opportunities (
            {opportunities.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Probability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No opportunities linked to this account.
                  </TableCell>
                </TableRow>
              )}
              {opportunities.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.name}</TableCell>
                  <TableCell>
                    <StatusBadge value={o.stage} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={o.grade} />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(o.value, true)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {o.probability}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Contracts */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Contracts ({contracts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Signed</TableHead>
                <TableHead>Ends</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No contracts linked to this account.
                  </TableCell>
                </TableRow>
              )}
              {contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <StatusBadge value={c.status} />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(c.amount, true)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(c.signed_date)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(c.end_date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Invoices ({invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No invoices linked to this account.
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">
                    {i.invoice_number ?? i.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={i.status} />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(i.amount, true)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCurrency(i.paid_amount, true)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(i.due_date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activities */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-4 w-4" /> Activity Timeline (
            {activities.length})
          </CardTitle>
          <ActivityFormButton accountId={id} contacts={contacts} />
        </CardHeader>
        <CardContent>
          {activities.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No activities logged yet.
            </p>
          )}
          <div className="space-y-4">
            {activities.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                  {a.type.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{a.subject}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {a.type}
                      </Badge>
                      <DeleteButton id={a.id} action={deleteActivity} />
                    </div>
                  </div>
                  {a.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {a.description}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground/60">
                    {formatDate(a.created_at)}
                    {a.outcome && ` · Outcome: ${a.outcome}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
