import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const MAP: Record<string, string> = {
  // lead / contract / campaign statuses
  New: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  Qualified: "border-chart-2/40 bg-chart-2/10 text-chart-2",
  Converted: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  Negotiation: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  "Closed Won": "border-chart-4/40 bg-chart-4/10 text-chart-4",
  Active: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  Completed: "border-muted-foreground/30 bg-muted text-muted-foreground",
  Signed: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  // grades
  Platinum: "border-primary/40 bg-primary/10 text-primary",
  Gold: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  Silver: "border-muted-foreground/30 bg-muted text-muted-foreground",
  Bronze: "border-chart-5/40 bg-chart-5/10 text-chart-5",
}

export function StatusBadge({ value }: { value: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        MAP[value] ?? "border-border bg-secondary text-secondary-foreground",
      )}
    >
      {value}
    </Badge>
  )
}
