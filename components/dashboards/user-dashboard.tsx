'use client'

import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        description="Your personal workspace and recent activity"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">My Tasks</p>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-blue-600 mt-2">3 pending</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-slate-500 mt-2">On track</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Completed</p>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-green-600 mt-2">This month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Alerts</p>
              <p className="text-2xl font-bold">2</p>
              <p className="text-xs text-orange-600 mt-2">Requires attention</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'Updated lead status', time: '2 hours ago', type: 'leads' },
            { action: 'Campaign review completed', time: '4 hours ago', type: 'campaigns' },
            { action: 'Added new opportunity', time: '1 day ago', type: 'pipeline' },
            { action: 'Generated report', time: '2 days ago', type: 'reports' },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-slate-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Links */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: 'View Pipeline', href: '/pipeline' },
            { title: 'My Leads', href: '/leads' },
            { title: 'Campaigns', href: '/campaigns' },
            { title: 'Reports', href: '/intelligence' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="p-4 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <span className="font-medium text-sm text-slate-900 hover:text-blue-600">
                {link.title}
              </span>
            </a>
          ))}
        </div>
      </Card>
    </div>
  )
}
