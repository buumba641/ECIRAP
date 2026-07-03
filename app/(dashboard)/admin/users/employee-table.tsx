"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Shield, Clock } from "lucide-react"
import { updateEmployeeRole, deleteEmployee } from "@/lib/admin-actions"

type Employee = {
  id: string
  full_name: string
  role: string
  branch: string | null
  email: string
  last_sign_in_at: string | null
  created_at: string
}

const ROLES = ["CEO", "Manager", "HR", "Analyst", "Marketing", "Cashier", "Sales", "Accountant"]

const ROLE_COLORS: Record<string, string> = {
  CEO: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  HR: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Analyst: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Marketing: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Cashier: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Sales: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  Accountant: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
}

export function EmployeeTable({ employees }: { employees: Employee[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleRoleChange(userId: string, newRole: string) {
    setLoadingId(userId)
    await updateEmployeeRole(userId, newRole)
    setLoadingId(null)
    router.refresh()
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Are you sure you want to delete ${email}? This cannot be undone.`)) return
    setLoadingId(userId)
    await deleteEmployee(userId)
    setLoadingId(null)
    router.refresh()
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Never"
    return new Date(dateStr).toLocaleDateString("en-ZM", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (employees.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No employees found. Create one above.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-3">Employee</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Branch</th>
            <th className="px-6 py-3">Last Login</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className={`transition-colors hover:bg-accent/50 ${
                loadingId === emp.id ? "opacity-50" : ""
              }`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {emp.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <span className="font-medium">{emp.full_name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-muted-foreground">{emp.email}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ROLE_COLORS[emp.role] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    {emp.role}
                  </span>
                  <select
                    value={emp.role}
                    onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                    disabled={loadingId === emp.id}
                    className="h-7 rounded border border-input bg-background px-1.5 text-xs opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                    title="Change role"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </td>
              <td className="px-6 py-4 text-muted-foreground">
                {emp.branch ?? "—"}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs">{formatDate(emp.last_sign_in_at)}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => handleDelete(emp.id, emp.email)}
                  disabled={loadingId === emp.id}
                  className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                  title="Delete employee"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
