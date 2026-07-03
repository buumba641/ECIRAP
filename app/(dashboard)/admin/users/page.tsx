import { getEmployees } from "@/lib/admin-actions"
import { PageHeader } from "@/components/page-header"
import { EmployeeForm } from "@/components/forms/employee-form"
import { EmployeeTable } from "./employee-table"
import { UserCog, Users } from "lucide-react"

export default async function AdminUsersPage() {
  const employees = await getEmployees()

  return (
    <>
      <PageHeader
        title="User Management"
        description="Create and manage employee accounts. Only HR and CEO have access to this page."
      />

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{employees.length}</p>
              <p className="text-xs text-muted-foreground">Total Employees</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {new Set(employees.map((e) => e.role)).size}
              </p>
              <p className="text-xs text-muted-foreground">Active Roles</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {new Set(employees.map((e) => e.branch)).size}
              </p>
              <p className="text-xs text-muted-foreground">Branches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Employee */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Create New Employee</h2>
        <EmployeeForm />
      </div>

      {/* Employee List */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">All Employees</h2>
          <p className="text-sm text-muted-foreground">
            Manage roles and access for all platform users
          </p>
        </div>
        <EmployeeTable employees={employees} />
      </div>
    </>
  )
}
