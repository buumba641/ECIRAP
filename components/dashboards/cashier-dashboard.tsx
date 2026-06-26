'use client'

import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { DollarSign, CreditCard, TrendingUp, Clock } from 'lucide-react'

export default function CashierDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cashier Dashboard"
        description="Payment processing and transaction management"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Today's Collections</p>
              <p className="text-2xl font-bold">$24.5K</p>
              <p className="text-xs text-green-600 mt-2">+15% vs yesterday</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Pending Payments</p>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-orange-600 mt-2">Total: $52K</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Transactions</p>
              <p className="text-2xl font-bold">42</p>
              <p className="text-xs text-slate-500 mt-2">This month</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Collection Rate</p>
              <p className="text-2xl font-bold">92%</p>
              <p className="text-xs text-green-600 mt-2">Target: 95%</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">Invoice</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Client</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {[
                { inv: 'INV-001', client: 'Acme Corp', amount: '$8,500', status: 'Paid' },
                { inv: 'INV-002', client: 'Tech Solutions', amount: '$12,000', status: 'Paid' },
                { inv: 'INV-003', client: 'Finance Plus', amount: '$4,000', status: 'Pending' },
              ].map((trans) => (
                <tr key={trans.inv} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 text-sm font-medium">{trans.inv}</td>
                  <td className="px-4 py-2 text-sm">{trans.client}</td>
                  <td className="px-4 py-2 text-sm font-semibold">{trans.amount}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      trans.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {trans.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">Today</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
