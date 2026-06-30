"use client"

import { useTransition } from "react"

export function StatusChanger({
  id,
  currentStatus,
  statuses,
  action,
}: {
  id: string
  currentStatus: string
  statuses: string[]
  action: (id: string, status: string) => Promise<{ error?: string; success?: boolean }>
}) {
  const [pending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    if (newStatus === currentStatus) return
    startTransition(async () => {
      const result = await action(id, newStatus)
      if (result?.error) alert(result.error)
    })
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={pending}
      className="rounded-md border border-input bg-background px-2 py-1 text-xs font-medium disabled:opacity-50"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}
