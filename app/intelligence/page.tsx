"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { supabase } from "@/lib/supabase/client"
import { BarChart3, TrendingUp, Zap } from "lucide-react"

interface IntelligenceData {
  revenueByRegion: Array<{ name: string; value: number }>
  pipelineByStage: Array<{ name: string; value: number; count: number }>
  campaignPerformance: Array<{ name: string; roi: number; revenue: number }>
  leadConversionTrend: Array<{ month: string; qualified: number; converted: number }>
}

export default function IntelligencePage() {
  const [data, setData] = useState<IntelligenceData>({
    revenueByRegion: [],
    pipelineByStage: [],
    campaignPerformance: [],
    leadConversionTrend: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIntelligenceData()
  }, [])

  const fetchIntelligenceData = async () => {
    try {
      setLoading(true)

      // Fetch campaigns with related data
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("*, leads(*), opportunities(*), contracts(*)")

      // Fetch opportunities for pipeline
      const { data: opportunities } = await supabase
        .from("opportunities")
        .select("*")

      // Fetch revenue transactions
      const { data: revenue } = await supabase
        .from("revenue_transactions")
        .select("*")

      // Process data for charts
      const revenueByRegion: Record<string, number> = {}
      const pipelineByStage: Record<string, { count: number; value: number }> = {}
      const campaignPerf: Array<{ name: string; roi: number; revenue: number }> = []

      // Region analysis
      campaigns?.forEach(campaign => {
        const region = campaign.region || "Headquarters"
        const contractsValue = campaign.contracts?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0
        revenueByRegion[region] = (revenueByRegion[region] || 0) + contractsValue
      })

      // Pipeline by stage
      opportunities?.forEach(opp => {
        const stage = opp.stage || "Qualified"
        if (!pipelineByStage[stage]) {
          pipelineByStage[stage] = { count: 0, value: 0 }
        }
        pipelineByStage[stage].count += 1
        pipelineByStage[stage].value += opp.value || 0
      })

      // Campaign performance
      campaigns?.forEach(campaign => {
        const revenue = campaign.contracts?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0
        const roi = campaign.budget > 0 ? Math.round((revenue / campaign.budget) * 100) : 0
        campaignPerf.push({
          name: campaign.name,
          roi,
          revenue,
        })
      })

      // Lead conversion trend
      const leadConversionByMonth: Record<string, { qualified: number; converted: number }> = {}
      campaigns?.forEach(campaign => {
        const month = new Date(campaign.created_at).toLocaleDateString("en-US", { month: "short" })
        if (!leadConversionByMonth[month]) {
          leadConversionByMonth[month] = { qualified: 0, converted: 0 }
        }
        const leads = campaign.leads || []
        leadConversionByMonth[month].qualified += leads.filter((l: any) => l.status === "Qualified").length
        leadConversionByMonth[month].converted += leads.filter((l: any) => l.status === "Converted").length
      })

      setData({
        revenueByRegion: Object.entries(revenueByRegion).map(([name, value]) => ({
          name,
          value: Math.round(value / 1000),
        })),
        pipelineByStage: Object.entries(pipelineByStage).map(([name, { count, value }]) => ({
          name,
          value: count,
          count,
        })),
        campaignPerformance: campaignPerf.slice(0, 5),
        leadConversionTrend: Object.entries(leadConversionByMonth)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([month, data]) => ({
            month,
            qualified: data.qualified,
            converted: data.converted,
          })),
      })
    } catch (error) {
      console.error("Error fetching intelligence data:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial Intelligence"
        description="Advanced analytics and insights. Analyze revenue distribution, pipeline health, campaign performance, and conversion trends."
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading intelligence data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Intelligence Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pipeline Value</span>
                    <span className="font-semibold">K{data.pipelineByStage.reduce((sum, s) => sum + s.count, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Campaign ROI</span>
                    <span className="font-semibold">{Math.round(data.campaignPerformance.reduce((sum, c) => sum + c.roi, 0) / data.campaignPerformance.length)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Region Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.revenueByRegion.slice(0, 3).map((region) => (
                    <div key={region.name} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground truncate">{region.name}</span>
                      <span className="font-semibold">K{region.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>• Pipeline consists of {data.pipelineByStage.length} stages</p>
                  <p>• Average ROI across campaigns: {Math.round(data.campaignPerformance.reduce((sum, c) => sum + c.roi, 0) / data.campaignPerformance.length)}%</p>
                  <p>• Total active opportunities: {data.pipelineByStage.reduce((sum, s) => sum + s.count, 0)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {data.revenueByRegion.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Region</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.revenueByRegion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {data.campaignPerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance (ROI %)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.campaignPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="roi" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {data.pipelineByStage.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Distribution by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.pipelineByStage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.pipelineByStage.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {data.leadConversionTrend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lead Conversion Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.leadConversionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="qualified" stroke="#8b5cf6" strokeWidth={2} />
                    <Line type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
