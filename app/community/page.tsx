"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase/client"
import { Heart, Users, TrendingUp, Award } from "lucide-react"

interface Engagement {
  id: string
  engagement_type: string
  participants: number
  impact_score: number
  description: string
  campaign_id?: string
  created_at?: string
}

export default function CommunityPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_events: 0,
    total_participants: 0,
    average_impact: 0,
    high_impact_count: 0,
  })

  useEffect(() => {
    fetchEngagements()
  }, [])

  const fetchEngagements = async () => {
    try {
      setLoading(true)
      
      const { data: engagementsData, error } = await supabase
        .from("community_engagements")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setEngagements(engagementsData || [])

      // Calculate stats
      const totalParticipants = engagementsData?.reduce((sum, e) => sum + (e.participants || 0), 0) || 0
      const totalImpact = engagementsData?.reduce((sum, e) => sum + (e.impact_score || 0), 0) || 0
      const highImpact = engagementsData?.filter(e => (e.impact_score || 0) > 75).length || 0

      setStats({
        total_events: engagementsData?.length || 0,
        total_participants: totalParticipants,
        average_impact: engagementsData && engagementsData.length > 0 ? totalImpact / engagementsData.length : 0,
        high_impact_count: highImpact,
      })
    } catch (error) {
      console.error("Error fetching engagements:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEngagementTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Event": "bg-blue-100 text-blue-800",
      "Workshop": "bg-purple-100 text-purple-800",
      "Conference": "bg-green-100 text-green-800",
      "Activation": "bg-pink-100 text-pink-800",
      "Sponsorship": "bg-yellow-100 text-yellow-800",
      "Webinar": "bg-indigo-100 text-indigo-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const getImpactLevel = (score: number) => {
    if (score >= 80) return { label: "Very High", color: "text-green-600" }
    if (score >= 60) return { label: "High", color: "text-blue-600" }
    if (score >= 40) return { label: "Medium", color: "text-yellow-600" }
    return { label: "Low", color: "text-gray-600" }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Community Engagements"
        description="Track community events, activations, and engagement initiatives. Measure impact and participant reach across campaigns."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Events"
          value={stats.total_events}
          icon={Heart}
          trend="+15%"
          trendType="up"
        />
        <KpiCard
          label="Total Participants"
          value={stats.total_participants}
          icon={Users}
          trend="+28%"
          trendType="up"
        />
        <KpiCard
          label="Avg Impact Score"
          value={Math.round(stats.average_impact)}
          icon={TrendingUp}
          trend="+8%"
          trendType="up"
        />
        <KpiCard
          label="High Impact Events"
          value={stats.high_impact_count}
          icon={Award}
          trend="+12%"
          trendType="up"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_participants}</div>
            <p className="text-xs text-muted-foreground mt-1">Community members engaged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Community Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.average_impact)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average engagement effectiveness</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Community Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : engagements.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No community engagements found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Participants</TableHead>
                    <TableHead className="text-center">Impact Score</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engagements.map((engagement) => {
                    const impactLevel = getImpactLevel(engagement.impact_score || 0)
                    return (
                      <TableRow key={engagement.id}>
                        <TableCell>
                          <Badge className={getEngagementTypeColor(engagement.engagement_type)}>
                            {engagement.engagement_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {engagement.description}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {engagement.participants}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-semibold ${impactLevel.color}`}>
                            {engagement.impact_score}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {engagement.created_at
                            ? new Date(engagement.created_at).toLocaleDateString()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
