"use client"

import { useState, useTransition } from "react"
import { Plus, Send, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type Request = {
  id: string
  title: string
  description: string
  type: string
  status: "Pending" | "Approved" | "Rejected"
  submittedAt: string
}

const INITIAL_REQUESTS: Request[] = [
  {
    id: "1",
    title: "Deploy v2.3.1 hotfix",
    description: "Critical authentication bug fix — needs CEO sign-off before pushing to production.",
    type: "Deployment",
    status: "Approved",
    submittedAt: "2026-07-08T09:15:00Z",
  },
  {
    id: "2",
    title: "Upgrade Supabase plan to Pro",
    description: "Current free tier approaching connection limits. Estimated cost: $25/mo.",
    type: "Infrastructure",
    status: "Pending",
    submittedAt: "2026-07-09T10:30:00Z",
  },
]

const STATUS_COLORS: Record<string, string> = {
  Pending:  "border-chart-3/40 bg-chart-3/10 text-chart-3",
  Approved: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  Rejected: "border-destructive/40 bg-destructive/10 text-destructive",
}

export function ChangeRequestClient() {
  const [requests, setRequests] = useState<Request[]>(INITIAL_REQUESTS)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("Deployment")
  const [isPending, startTransition] = useTransition()

  function submit() {
    if (!title.trim()) return
    startTransition(() => {
      const next: Request = {
        id: String(Date.now()),
        title,
        description,
        type,
        status: "Pending",
        submittedAt: new Date().toISOString(),
      }
      setRequests((prev) => [next, ...prev])
      setTitle("")
      setDescription("")
      setShowForm(false)
    })
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Change Request
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-secondary/30 p-5 space-y-4">
          <h3 className="text-sm font-semibold">Submit Change Request</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deploy v2.4.0"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {["Deployment", "Infrastructure", "Config Change", "Security Patch", "Feature Flag"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the change, why it's needed, and any risks..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={submit} disabled={isPending || !title.trim()} className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Submit for Approval
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{r.title}</p>
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {r.type}
                  </span>
                </div>
                {r.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Submitted {new Date(r.submittedAt).toLocaleString()}
                </p>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                {r.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
