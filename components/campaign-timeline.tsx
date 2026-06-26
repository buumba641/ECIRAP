'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Check, Clock, AlertCircle } from 'lucide-react'

interface Milestone {
  name: string
  date: string
  status: 'Completed' | 'Pending' | 'In Progress'
}

interface RevenuePoint {
  date: string
  revenue: number
  cumulative: number
}

interface CampaignTimelineProps {
  campaignName: string
  startDate: string
  endDate: string
  milestones: Milestone[]
  revenueData: RevenuePoint[]
}

export function CampaignTimeline({
  campaignName,
  startDate,
  endDate,
  milestones,
  revenueData,
}: CampaignTimelineProps) {
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const periodDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Campaign Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Date range */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {new Date(startDate).toLocaleDateString()} → {new Date(endDate).toLocaleDateString()}
              </span>
              <span className="font-semibold text-slate-900">{periodDays} days</span>
            </div>

            {/* Milestones */}
            <div className="space-y-3">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        milestone.status === 'Completed'
                          ? 'bg-green-100'
                          : milestone.status === 'In Progress'
                          ? 'bg-blue-100'
                          : 'bg-slate-100'
                      }`}
                    >
                      {milestone.status === 'Completed' && (
                        <Check className="h-5 w-5 text-green-600" />
                      )}
                      {milestone.status === 'In Progress' && (
                        <Clock className="h-5 w-5 text-blue-600" />
                      )}
                      {milestone.status === 'Pending' && (
                        <AlertCircle className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    {idx < milestones.length - 1 && (
                      <div className="my-1 h-8 w-1 bg-slate-200" />
                    )}
                  </div>

                  {/* Milestone content */}
                  <div className="flex-1 pb-2">
                    <p className="font-medium text-slate-900">{milestone.name}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(milestone.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {milestone.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Period */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Period</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Bar dataKey="revenue" fill="#3B82F6" name="Daily Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cumulative Revenue Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Revenue Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#10B981"
                name="Cumulative Revenue"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Period Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-600">Total Revenue (Period)</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-slate-600">Average Daily Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ${Math.round(totalRevenue / Math.max(revenueData.length, 1)).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-slate-600">Peak Daily Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ${Math.max(...revenueData.map(d => d.revenue)).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
