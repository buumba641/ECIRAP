'use client'

import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react'

const CONVERSION_DATA = [
  { stage: 'Leads', count: 156, pct: 100 },
  { stage: 'Qualified', count: 98, pct: 63 },
  { stage: 'Negotiation', count: 42, pct: 27 },
  { stage: 'Closed', count: 18, pct: 12 },
]

const TREND_DATA = [
  { month: 'Jan', leads: 120, deals: 8, revenue: 45000 },
  { month: 'Feb', leads: 140, deals: 10, revenue: 52000 },
  { month: 'Mar', leads: 155, deals: 12, revenue: 62000 },
  { month: 'Apr', leads: 168, deals: 14, revenue: 71000 },
]

export default function AnalystDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Detailed insights and business intelligence"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold">11.5%</p>
              <p className="text-xs text-green-600 mt-2">+2.3% improvement</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Avg Deal Value</p>
              <p className="text-2xl font-bold">$42.8K</p>
              <p className="text-xs text-slate-500 mt-2">Up from $38.2K</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Sales Cycle</p>
              <p className="text-2xl font-bold">45 days</p>
              <p className="text-xs text-slate-500 mt-2">-5 days vs Q1</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <PieChartIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Sales Funnel Analysis</h3>
        <div className="space-y-4">
          {CONVERSION_DATA.map((item) => (
            <div key={item.stage}>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-sm">{item.stage}</span>
                <span className="text-sm text-slate-600">{item.count} ({item.pct}%)</span>
              </div>
              <div className="h-8 bg-slate-200 rounded-lg overflow-hidden flex items-center px-3">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${item.pct}%` }} />
                <span className="text-white text-xs font-semibold ml-2">{item.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trends */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Key Metrics Trend (Q1-Q2)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={TREND_DATA}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="leads" stroke="#3B82F6" name="Leads" />
            <Line type="monotone" dataKey="deals" stroke="#10B981" name="Deals Closed" />
            <Line type="monotone" dataKey="revenue" stroke="#F59E0B" name="Revenue ($000)" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
