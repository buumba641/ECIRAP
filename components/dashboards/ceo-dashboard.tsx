'use client'

import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, Zap, DollarSign, Target, Activity } from 'lucide-react'

const REVENUE_DATA = [
  { month: 'Jan', revenue: 45000, target: 50000 },
  { month: 'Feb', revenue: 52000, target: 50000 },
  { month: 'Mar', revenue: 48000, target: 55000 },
  { month: 'Apr', revenue: 61000, target: 55000 },
  { month: 'May', revenue: 55000, target: 60000 },
  { month: 'Jun', revenue: 67000, target: 65000 },
]

const PIPELINE_DATA = [
  { name: 'Qualified', value: 35, fill: '#3B82F6' },
  { name: 'Negotiation', value: 25, fill: '#10B981' },
  { name: 'Closed Won', value: 40, fill: '#F59E0B' },
]

const SALES_BY_TEAM = [
  { team: 'Sales Team A', sales: 45000, target: 50000 },
  { team: 'Sales Team B', sales: 38000, target: 45000 },
  { team: 'Sales Team C', sales: 52000, target: 48000 },
  { team: 'Sales Team D', sales: 41000, target: 42000 },
]

export default function CEODashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        description="Complete business overview and strategic metrics"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">$328K</p>
              <p className="text-xs text-green-600 mt-2">+12% vs last month</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Active Campaigns</p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-slate-500 mt-2">4 launching this month</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Pipeline Value</p>
              <p className="text-2xl font-bold">$845K</p>
              <p className="text-xs text-blue-600 mt-2">+8% growth</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Team Members</p>
              <p className="text-2xl font-bold">28</p>
              <p className="text-xs text-slate-500 mt-2">All departments</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Revenue Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Actual Revenue" />
              <Line type="monotone" dataKey="target" stroke="#EF4444" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Pipeline Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Pipeline Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={PIPELINE_DATA}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${value}K`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {PIPELINE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}K`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Sales by Team */}
        <Card className="col-span-1 lg:col-span-2 p-6">
          <h3 className="font-semibold mb-4">Sales Performance by Team</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={SALES_BY_TEAM}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="team" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="sales" fill="#3B82F6" name="Actual Sales" />
              <Bar dataKey="target" fill="#EF4444" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Strategic Alerts */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-600" />
          Strategic Alerts
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="w-2 h-2 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Q2 Target at Risk</p>
              <p className="text-xs text-slate-600">Current revenue is 8% below target. Recommend campaign acceleration.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">High Performer: Sales Team C</p>
              <p className="text-xs text-slate-600">Exceeded target by 8%. Recommend for promotion consideration.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
