"use client"

import { useState, useTransition } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateQuotationStatus } from "@/lib/actions"

export function ApproveButton({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition()

  function approve() {
    startTransition(async () => {
      await updateQuotationStatus(id, "Accepted")
    })
  }

  function reject() {
    startTransition(async () => {
      await updateQuotationStatus(id, "Rejected")
    })
  }

  if (currentStatus === "Accepted") {
    return <span className="text-xs font-medium text-chart-4">✓ Approved</span>
  }
  if (currentStatus === "Rejected") {
    return <span className="text-xs font-medium text-destructive">✗ Rejected</span>
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-7 border-chart-4/40 text-chart-4 hover:bg-chart-4/10"
        onClick={approve}
        disabled={isPending}
      >
        <CheckCircle className="mr-1 h-3.5 w-3.5" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 border-destructive/40 text-destructive hover:bg-destructive/10"
        onClick={reject}
        disabled={isPending}
      >
        <XCircle className="mr-1 h-3.5 w-3.5" />
        Reject
      </Button>
    </div>
  )
}
