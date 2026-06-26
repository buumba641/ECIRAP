'use client'

import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Users, UserCheck, TrendingUp, AlertCircle } from 'lucide-react'

export default function HRDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Dashboard"
        description="Employee management and organization metrics"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Employees</p>
              <p className="text-2xl font-bold">28</p>
              <p className="text-xs text-slate-500 mt-2">All departments</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Active Users</p>
              <p className="text-2xl font-bold">27</p>
              <p className="text-xs text-green-600 mt-2">96% active</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Departments</p>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-slate-500 mt-2">Sales, Finance, Ops...</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Pending Actions</p>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-orange-600 mt-2">Requires review</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Employee Directory */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Employee Directory</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Role</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Department</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'James CEO', role: 'CEO', dept: 'Executive', status: 'Active' },
                { name: 'Sarah Manager', role: 'Manager', dept: 'Sales', status: 'Active' },
                { name: 'Mike Sales', role: 'Sales', dept: 'Sales', status: 'Active' },
                { name: 'Emma Cashier', role: 'Cashier', dept: 'Finance', status: 'Active' },
                { name: 'David Analyst', role: 'Analyst', dept: 'Analytics', status: 'Active' },
                { name: 'Lisa Accountant', role: 'Accountant', dept: 'Finance', status: 'Active' },
                { name: 'Rachel HR', role: 'HR', dept: 'HR', status: 'Active' },
              ].map((emp) => (
                <tr key={emp.name} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 text-sm font-medium">{emp.name}</td>
                  <td className="px-4 py-2 text-sm">{emp.role}</td>
                  <td className="px-4 py-2 text-sm">{emp.dept}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* HR Actions */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Quick HR Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a
            href="/hr-admin"
            className="p-4 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <span className="font-medium text-sm text-slate-900 hover:text-blue-600 block">
              Manage Users
            </span>
            <span className="text-xs text-slate-500">Create, edit, delete accounts</span>
          </a>
          <a
            href="#"
            className="p-4 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <span className="font-medium text-sm text-slate-900 hover:text-blue-600 block">
              View Reports
            </span>
            <span className="text-xs text-slate-500">Performance & analytics</span>
          </a>
          <a
            href="#"
            className="p-4 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <span className="font-medium text-sm text-slate-900 hover:text-blue-600 block">
              Audit Logs
            </span>
            <span className="text-xs text-slate-500">System activity tracking</span>
          </a>
        </div>
      </Card>
    </div>
  )
}
