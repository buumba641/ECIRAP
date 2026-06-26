'use client'

import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, FileText, Clock, CheckCircle } from 'lucide-react'

const SALES_TREND = [
  { week: 'Week 1', sales: 8000, target: 9000 },
  { week: 'Week 2', sales: 9500, target: 9000 },
  { week: 'Week 3', sales: 8200, target: 9000 },
  { week: 'Week 4', sales: 11000, target: 10000 },
]

export default function SalesDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Dashboard"
        description="Your leads, pipeline, and performance metrics"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Monthly Sales</p>
              <p className="text-2xl font-bold">$42K</p>
              <p className="text-xs text-green-600 mt-2">+8% vs last month</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Open Leads</p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-slate-500 mt-2">Follow-ups pending</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Active Deals</p>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-blue-600 mt-2">$156K pipeline</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Closed This Month</p>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-green-600 mt-2">$105K revenue</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Trend */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Weekly Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={SALES_TREND}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#3B82F6" name="Your Sales" />
            <Line type="monotone" dataKey="target" stroke="#EF4444" name="Target" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Leads */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recent Leads</h3>
        <div className="space-y-3">
          {[
            { name: 'Acme Corp', status: 'Qualified', value: '$45K' },
            { name: 'Tech Innovations', status: 'Prospect', value: '$32K' },
            { name: 'Global Finance', status: 'Negotiation', value: '$78K' },
          ].map((lead) => (
            <div key={lead.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">{lead.name}</p>
                <p className="text-xs text-slate-600">{lead.status}</p>
              </div>
              <span className="font-semibold text-slate-900">{lead.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
