"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"

export function DeleteButton({
  id,
  action,
  label = "Delete",
}: {
  id: string
  action: (id: string) => Promise<{ error?: string; success?: boolean }>
  label?: string
}) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Are you sure you want to delete this? This action cannot be undone.`)) return
    startTransition(async () => {
      const result = await action(id)
      if (result?.error) alert(result.error)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive disabled:opacity-50 transition-colors"
      title={label}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {pending ? "…" : ""}
    </button>
  )
}
