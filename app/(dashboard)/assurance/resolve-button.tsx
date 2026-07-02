"use client"

import { useTransition } from "react"
import { CheckCircle } from "lucide-react"
import { resolveAlert } from "@/lib/actions"

export function ResolveAlertButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  function handleResolve() {
    startTransition(async () => {
      await resolveAlert(id)
    })
  }

  return (
    <button
      onClick={handleResolve}
      disabled={pending}
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-chart-4/30 px-2.5 py-1.5 text-xs font-medium text-chart-4 hover:bg-chart-4/10 disabled:opacity-50 transition-colors"
    >
      <CheckCircle className="h-3.5 w-3.5" />
      {pending ? "…" : "Resolve"}
    </button>
  )
}
