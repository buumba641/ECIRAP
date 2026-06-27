"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ExportButtons({ data }: { data: any[] }) {
  const exportToCSV = () => {
    if (!data || !data.length) return
    const headers = Object.keys(data[0]).join(",")
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${val}"`)
        .join(",")
    )
    const csv = [headers, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "campaign_data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={exportToCSV}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      {/* For PDF, we can use window.print() as a quick proxy for saving insights to PDF */}
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Download className="mr-2 h-4 w-4" />
        Save PDF
      </Button>
    </div>
  )
}
