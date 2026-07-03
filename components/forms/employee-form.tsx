"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { createEmployee } from "@/lib/admin-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ROLES = ["Sales", "Manager", "HR", "Analyst", "Marketing", "Cashier", "Accountant", "CEO"] as const
const BRANCHES = [
  "Lusaka HQ", "Kitwe Branch", "Ndola Branch", "Livingstone Branch",
  "Chipata Branch", "Solwezi Branch", "Kasama Branch",
] as const

export function EmployeeForm({ onSuccess }: { onSuccess?: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createEmployee(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    e.currentTarget.reset()
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="e.g. Mulenga Kapwepwe"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp_email">Email</Label>
          <Input
            id="emp_email"
            name="email"
            type="email"
            placeholder="employee@ecirap.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp_password">Password</Label>
          <Input
            id="emp_password"
            name="password"
            type="text"
            placeholder="Initial password"
            required
            minLength={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp_role">Role</Label>
          <select
            id="emp_role"
            name="role"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="emp_branch">Branch</Label>
          <select
            id="emp_branch"
            name="branch"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {BRANCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          ✓ Employee account created successfully. They can now sign in.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          "Creating…"
        ) : (
          <>
            <UserPlus className="h-4 w-4" /> Create Employee Account
          </>
        )}
      </button>
    </form>
  )
}
