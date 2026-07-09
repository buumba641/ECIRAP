import {
  Users2,
  Phone,
  Mail,
  Star,
  CalendarDays,
  StickyNote,
  MessageSquare,
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
import { getContacts, getActivities, getAccounts } from "@/lib/data"
import { formatDate } from "@/lib/format"

const ROLE_COLORS: Record<string, string> = {
  "Decision Maker": "border-chart-1/40 bg-chart-1/10 text-chart-1",
  Influencer: "border-chart-2/40 bg-chart-2/10 text-chart-2",
  Technical: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  "End User": "border-muted-foreground/40 bg-muted text-muted-foreground",
  Champion: "border-chart-4/40 bg-chart-4/10 text-chart-4",
}

const ACTIVITY_ICONS: Record<string, typeof StickyNote> = {
  Call: Phone,
  Email: Mail,
  Meeting: CalendarDays,
  Note: StickyNote,
  Task: Star,
  "Follow-up": MessageSquare,
}

const ACTIVITY_COLORS: Record<string, string> = {
  Call: "bg-chart-1/10 text-chart-1",
  Email: "bg-chart-2/10 text-chart-2",
  Meeting: "bg-chart-3/10 text-chart-3",
  Note: "bg-secondary text-secondary-foreground",
  Task: "bg-chart-5/10 text-chart-5",
  "Follow-up": "bg-chart-4/10 text-chart-4",
}

export default async function MyCustomersPage() {
  const [contacts, activities, accounts] = await Promise.all([
    getContacts(),
    getActivities(),
    getAccounts(),
  ])

  const acctMap = new Map(accounts.map((a) => [a.id, a.name]))
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15)

  const primaryContacts = contacts.filter((c) => c.is_primary)

  return (
    <div>
      <PageHeader
        title="My Customers"
        description="Your contacts, accounts, and activity log — the digital replacement for your field notebook."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total Contacts"
          value={String(contacts.length)}
          icon={Users2}
          hint={`${primaryContacts.length} primary contacts`}
        />
        <KpiCard
          label="Accounts Covered"
          value={String(accounts.length)}
          icon={Star}
          hint="active accounts"
        />
        <KpiCard
          label="Activities Logged"
          value={String(activities.length)}
          icon={MessageSquare}
          hint="calls, emails & meetings"
        />
      </div>

      {/* Contacts Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            Customer Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No contacts yet. Add contacts from the Accounts page.
                  </TableCell>
                </TableRow>
              )}
              {contacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {c.first_name[0]}{c.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{c.first_name} {c.last_name}</p>
                        {c.job_title && (
                          <p className="text-xs text-muted-foreground">{c.job_title}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.account_id ? acctMap.get(c.account_id) ?? "—" : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ROLE_COLORS[c.role] ?? ""}>
                      {c.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {c.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.email ?? "—"}
                  </TableCell>
                  <TableCell>
                    {c.is_primary && (
                      <Badge variant="outline" className="border-chart-4/40 bg-chart-4/10 text-chart-4">
                        Primary
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(c.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Recent Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No activities logged yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a) => {
                const Icon = ACTIVITY_ICONS[a.type] ?? StickyNote
                const colorClass = ACTIVITY_COLORS[a.type] ?? "bg-secondary text-secondary-foreground"
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${colorClass}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{a.subject}</p>
                          {a.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                              {a.description}
                            </p>
                          )}
                          {a.outcome && (
                            <p className="mt-1 text-xs font-medium text-chart-4">
                              Outcome: {a.outcome}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <Badge variant="outline" className="text-[10px]">
                            {a.type}
                          </Badge>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {formatDate(a.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
