"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateCampaignInsights } from "@/app/campaigns/actions"

export function AIInsights() {
  const [insights, setInsights] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const text = await generateCampaignInsights()
        setInsights(text)
      } catch (e) {
        setInsights("Failed to load insights.")
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [])

  return (
    <Card className="mb-6 bg-primary/5 border-primary/20">
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg">AI Campaign Intelligence</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex animate-pulse space-x-4">
            <div className="flex-1 space-y-3 py-1">
              <div className="h-2 rounded bg-primary/20"></div>
              <div className="h-2 rounded bg-primary/20"></div>
              <div className="h-2 rounded bg-primary/20 w-5/6"></div>
            </div>
          </div>
        ) : (
          <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
            {insights?.split('\n').map((line, i) => (
              <p key={i} className="mb-2 last:mb-0">{line}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
