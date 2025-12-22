"use client"

import { cn } from "@/lib/utils"
import { LoadingSkeleton } from "./LoadingSkeleton"
import { EmptyState } from "./EmptyState"

export interface Column<T> {
  key: string
  header: string
  cell: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  className?: string
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  loading,
  emptyMessage = "No data found.",
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return <LoadingSkeleton className="h-40" />
  }

  if (!data.length) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border", className)}>
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr className="bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider",
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/50"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-4 py-3 text-sm", col.className)}
                >
                  {col.cell(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}