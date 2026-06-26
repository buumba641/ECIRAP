'use client'

import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, Target, AlertCircle } from 'lucide-react'

const TEAM_PERFORMANCE = [
  { name: 'Mike', sales: 42000, target: 40000 },
  { name: 'Sarah', sales: 38000, target: 40000 },
  { name: 'John', sales: 45000, target: 40000 },
  { name: 'Lisa', sales: 35000, target: 40000 },
]

const CAMPAIGN_STATUS = [
  { campaign: 'Facebook', progress: 75 },
  { campaign: 'Radio', progress: 60 },
  { campaign: 'Events', progress: 85 },
  { campaign: 'LinkedIn', progress: 45 },
]

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Dashboard"
        description="Team performance and campaign management"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Team Sales</p>
              <p className="text-2xl font-bold">$160K</p>
              <p className="text-xs text-green-600 mt-2">+5% vs target</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Team Members</p>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-slate-500 mt-2">All active</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Active Campaigns</p>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-slate-500 mt-2">Avg 66% complete</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Team Sales Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={TEAM_PERFORMANCE}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="sales" fill="#3B82F6" name="Actual Sales" />
              <Bar dataKey="target" fill="#EF4444" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Campaign Progress</h3>
          <div className="space-y-4">
            {CAMPAIGN_STATUS.map((camp) => (
              <div key={camp.campaign}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{camp.campaign}</span>
                  <span className="text-sm text-slate-600">{camp.progress}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${camp.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Team Members</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Role</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Sales</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {['Mike', 'Sarah', 'John', 'Lisa'].map((member) => (
                <tr key={member} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 text-sm">{member}</td>
                  <td className="px-4 py-2 text-sm">Sales Personnel</td>
                  <td className="px-4 py-2 text-sm font-medium">$42K</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
