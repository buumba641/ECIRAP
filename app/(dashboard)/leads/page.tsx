import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getEnterpriseData, leadsByStatus } from "@/lib/data"
import { LeadFormButton } from "@/components/forms/lead-form"
import { DeleteButton } from "@/components/delete-button"
import { StatusChanger } from "@/components/status-changer"
import { deleteLead, updateLeadStatus } from "@/lib/actions"

export default async function LeadsPage() {
  const { leads, campaigns } = await getEnterpriseData()
  const campMap = new Map(campaigns.map((c) => [c.id, c.name]))
  const byStatus = leadsByStatus(leads)

  return (
    <div>
      <PageHeader
        title="Lead Management"
        description="Centralised lead capture with qualification scoring and ownership — the first stage of the commercial pipeline."
      >
        <LeadFormButton campaigns={campaigns} />
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <p className="mt-1 text-xl font-semibold">{leads.length}</p>
          </CardContent>
        </Card>
        {byStatus.map((s) => (
          <Card key={s.status}>
            <CardContent>
              <p className="text-sm text-muted-foreground">{s.status}</p>
              <p className="mt-1 text-xl font-semibold">{s.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="w-40">Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    No leads yet. Click &quot;New Lead&quot; to create your first lead.
                  </TableCell>
                </TableRow>
              )}
              {leads.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <p className="font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.email}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {l.company}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {l.source}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {l.campaign_id ? campMap.get(l.campaign_id) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {l.owner ?? "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={l.score} className="h-1.5" />
                      <span className="w-7 text-right text-xs font-medium tabular-nums">
                        {l.score}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusChanger
                      id={l.id}
                      currentStatus={l.status}
                      statuses={["New", "Qualified", "Converted"]}
                      action={updateLeadStatus}
                    />
                  </TableCell>
                  <TableCell>
                    <DeleteButton id={l.id} action={deleteLead} />
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
