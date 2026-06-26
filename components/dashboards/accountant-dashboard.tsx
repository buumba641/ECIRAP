'use client'

import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

const REVENUE_BY_SOURCE = [
  { source: 'Contracts', amount: 250000 },
  { source: 'Services', amount: 145000 },
  { source: 'Support', amount: 98000 },
  { source: 'Licensing', amount: 127000 },
]

export default function AccountantDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Dashboard"
        description="Revenue, expenses, and financial health"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">$620K</p>
              <p className="text-xs text-green-600 mt-2">+18% YoY</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Operating Costs</p>
              <p className="text-2xl font-bold">$180K</p>
              <p className="text-xs text-orange-600 mt-2">29% of revenue</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Net Profit</p>
              <p className="text-2xl font-bold">$440K</p>
              <p className="text-xs text-green-600 mt-2">71% margin</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">A/R Balance</p>
              <p className="text-2xl font-bold">$85K</p>
              <p className="text-xs text-slate-500 mt-2">30-day avg</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue by Source */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Revenue by Source</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={REVENUE_BY_SOURCE}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="source" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Bar dataKey="amount" fill="#10B981" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Financial Summary */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Monthly Financial Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">Month</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Revenue</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Costs</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Profit</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Margin</th>
              </tr>
            </thead>
            <tbody>
              {[
                { month: 'January', rev: 145000, cost: 42000, profit: 103000 },
                { month: 'February', rev: 168000, cost: 48000, profit: 120000 },
                { month: 'March', rev: 182000, cost: 51000, profit: 131000 },
                { month: 'April', rev: 195000, cost: 54000, profit: 141000 },
              ].map((row) => (
                <tr key={row.month} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 text-sm font-medium">{row.month}</td>
                  <td className="px-4 py-2 text-sm">${(row.rev / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-2 text-sm">${(row.cost / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-2 text-sm font-semibold">${(row.profit / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="text-green-600 font-semibold">
                      {Math.round((row.profit / row.rev) * 100)}%
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
