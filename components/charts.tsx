"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/format"

/* Revenue by campaign / region — horizontal bars */
export function RevenueBarChart({
  data,
  dataKey = "revenue",
  categoryKey,
}: {
  data: Record<string, unknown>[]
  dataKey?: string
  categoryKey: string
}) {
  const config = {
    [dataKey]: { label: "Revenue", color: "var(--chart-1)" },
  } satisfies ChartConfig

  return (
    <ChartContainer config={config} className="h-[280px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 8, right: 16 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCurrency(Number(v), true)}
        />
        <YAxis
          type="category"
          dataKey={categoryKey}
          tickLine={false}
          axisLine={false}
          width={130}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Bar dataKey={dataKey} fill="var(--color-revenue)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

/* Pipeline by stage — vertical bars (value) */
export function PipelineBarChart({
  data,
}: {
  data: { stage: string; value: number; count: number }[]
}) {
  const config = {
    value: { label: "Pipeline Value", color: "var(--chart-1)" },
  } satisfies ChartConfig

  return (
    <ChartContainer config={config} className="h-[280px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="stage"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCurrency(Number(v), true)}
          width={60}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

/* Lead status — donut */
const STATUS_COLORS: Record<string, string> = {
  New: "var(--chart-3)",
  Qualified: "var(--chart-2)",
  Converted: "var(--chart-4)",
}

export function LeadStatusChart({
  data,
}: {
  data: { status: string; count: number }[]
}) {
  const config = {
    count: { label: "Leads" },
    New: { label: "New", color: "var(--chart-3)" },
    Qualified: { label: "Qualified", color: "var(--chart-2)" },
    Converted: { label: "Converted", color: "var(--chart-4)" },
  } satisfies ChartConfig

  return (
    <ChartContainer
      config={config}
      className="mx-auto aspect-square h-[280px]"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          innerRadius={60}
          strokeWidth={4}
        >
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] ?? "var(--chart-5)"}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
