import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type RemixiconComponentType } from "@remixicon/react"

interface StatsCardProps {
  label: string
  value: string | number
  icon?: RemixiconComponentType
  trend?: {
    value: string
    positive: boolean
  }
  className?: string
}

export function StatsCard({ label, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card size="sm" className={cn("overflow-hidden", className)}>
      <CardContent className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 space-y-0.5">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold">{value}</span>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-green-600" : "text-destructive"
                )}
              >
                {trend.positive ? "+" : ""}
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}