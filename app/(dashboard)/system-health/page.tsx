import {
  Activity,
  Server,
  Cpu,
  Database,
  Wifi,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Static telemetry — no DB table required; replace with real health-check calls
const SERVICES = [
  { name: "Web Application",    status: "Operational",  uptime: 99.97, latency: 42  },
  { name: "API Gateway",        status: "Operational",  uptime: 99.94, latency: 18  },
  { name: "Database (Supabase)",status: "Operational",  uptime: 99.99, latency: 8   },
  { name: "Auth Service",       status: "Operational",  uptime: 99.91, latency: 12  },
  { name: "File Storage",       status: "Operational",  uptime: 99.80, latency: 65  },
  { name: "Email Service",      status: "Degraded",     uptime: 98.20, latency: 320 },
  { name: "Job Queue",          status: "Operational",  uptime: 99.60, latency: 35  },
]

const RECENT_INCIDENTS = [
  { id: "1", title: "Email service latency spike", severity: "Medium", at: "2026-07-09T14:22:00Z", resolved: true },
  { id: "2", title: "Scheduled DB vacuum — brief slowdown", severity: "Low", at: "2026-07-08T02:00:00Z", resolved: true },
  { id: "3", title: "API rate-limit warning (burst)", severity: "Low", at: "2026-07-07T11:45:00Z", resolved: true },
]

const STATUS_COLORS: Record<string, string> = {
  Operational: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  Degraded:    "border-chart-5/40 bg-chart-5/10 text-chart-5",
  Outage:      "border-destructive/40 bg-destructive/10 text-destructive",
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "border-destructive/40 bg-destructive/10 text-destructive",
  High:     "border-chart-5/40 bg-chart-5/10 text-chart-5",
  Medium:   "border-chart-3/40 bg-chart-3/10 text-chart-3",
  Low:      "border-muted-foreground/40 bg-muted text-muted-foreground",
}

const operational = SERVICES.filter((s) => s.status === "Operational").length
const overallUptime = SERVICES.reduce((s, svc) => s + svc.uptime, 0) / SERVICES.length
const avgLatency = Math.round(SERVICES.reduce((s, svc) => s + svc.latency, 0) / SERVICES.length)

export default function SystemHealthPage() {
  return (
    <div>
      <PageHeader
        title="System Health"
        description="Infrastructure telemetry — service uptime, response latency, and incident history."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Overall Uptime"
          value={`${overallUptime.toFixed(2)}%`}
          icon={Activity}
          trend={{ value: "SLA Target: 99.9%", positive: overallUptime >= 99.9 }}
        />
        <KpiCard
          label="Services Online"
          value={`${operational} / ${SERVICES.length}`}
          icon={Server}
          trend={{ value: operational === SERVICES.length ? "All OK" : "Degraded", positive: operational === SERVICES.length }}
        />
        <KpiCard
          label="Avg Latency"
          value={`${avgLatency} ms`}
          icon={Wifi}
          hint="across all services"
        />
        <KpiCard
          label="Open Incidents"
          value="0"
          icon={CheckCircle}
          trend={{ value: "All resolved", positive: true }}
        />
      </div>

      {/* Service Status Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((svc) => (
          <Card key={svc.name} className={svc.status !== "Operational" ? "border-chart-5/30" : ""}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${svc.status === "Operational" ? "bg-chart-4/10 text-chart-4" : "bg-chart-5/10 text-chart-5"}`}>
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{svc.name}</p>
                    <p className="text-xs text-muted-foreground">{svc.latency} ms avg</p>
                  </div>
                </div>
                <Badge variant="outline" className={STATUS_COLORS[svc.status]}>{svc.status}</Badge>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Uptime (30d)</span>
                  <span className="font-medium tabular-nums">{svc.uptime.toFixed(2)}%</span>
                </div>
                <Progress
                  value={svc.uptime}
                  className={`h-1.5 ${svc.uptime >= 99.9 ? "[&>[data-slot=indicator]]:bg-chart-4" : "[&>[data-slot=indicator]]:bg-chart-5"}`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resource Meters */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Cpu className="h-4 w-4" /> CPU Usage</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">34%</p>
            <Progress value={34} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Database className="h-4 w-4" /> DB Connections</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12 / 100</p>
            <Progress value={12} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Activity className="h-4 w-4" /> Job Queue</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3 pending</p>
            <Progress value={3} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Recent Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RECENT_INCIDENTS.map((inc) => (
              <div key={inc.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-chart-4" />
                  <div>
                    <p className="text-sm font-medium">{inc.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(inc.at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={SEVERITY_COLORS[inc.severity]}>{inc.severity}</Badge>
                  {inc.resolved && (
                    <Badge variant="outline" className="border-chart-4/40 bg-chart-4/10 text-chart-4">Resolved</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
