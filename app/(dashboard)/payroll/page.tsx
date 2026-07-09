import {
  Banknote,
  Users,
  AlertCircle,
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
import { getProfiles } from "@/lib/data"
import { formatDate } from "@/lib/format"

const ROLE_COLORS: Record<string, string> = {
  CEO: "border-chart-1/40 bg-chart-1/10 text-chart-1",
  Manager: "border-chart-2/40 bg-chart-2/10 text-chart-2",
  Sales: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  Accountant: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  HR: "border-muted-foreground/40 bg-muted text-muted-foreground",
  Marketing: "border-chart-5/40 bg-chart-5/10 text-chart-5",
  Cashier: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  Analyst: "border-chart-2/40 bg-chart-2/10 text-chart-2",
  IT: "border-muted-foreground/40 bg-muted text-muted-foreground",
  TeamLead: "border-chart-1/40 bg-chart-1/10 text-chart-1",
}

export default async function PayrollPage() {
  const employees = await getProfiles()

  const active = employees.filter((e) => e.is_active)
  const inactive = employees.filter((e) => !e.is_active)

  return (
    <div>
      <PageHeader
        title="Payroll & Disbursements"
        description="Employee workforce overview and payment management. Release salaries and track disbursement history."
      />

      {/* Schema note */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-chart-5/30 bg-chart-5/5 p-4">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-chart-5" />
        <div>
          <p className="text-sm font-medium text-foreground">Payroll schema pending</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Salary fields, pay grade, and disbursement history require a{" "}
            <code className="rounded bg-secondary px-1 text-xs">payroll_disbursements</code> table
            and <code className="rounded bg-secondary px-1 text-xs">salary</code> field on employees.
            Currently showing employee directory only.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total Employees"
          value={String(employees.length)}
          icon={Users}
          hint={`${active.length} active`}
        />
        <KpiCard
          label="Active"
          value={String(active.length)}
          icon={Banknote}
          trend={{ value: "On Payroll", positive: true }}
        />
        <KpiCard
          label="Inactive"
          value={String(inactive.length)}
          icon={Info}
          hint="off payroll"
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Salary (ZMW)</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {e.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{e.full_name}</p>
                        <p className="text-xs text-muted-foreground">{e.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ROLE_COLORS[e.role] ?? ""}>{e.role}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.branch ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={e.is_active ? "default" : "secondary"}>
                      {e.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground italic text-sm">Pending schema</TableCell>
                  <TableCell className="text-muted-foreground italic text-sm">Pending schema</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(e.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
