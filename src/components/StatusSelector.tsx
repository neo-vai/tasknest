"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const statuses = ["TODO", "IN_PROGRESS", "DONE"] as const
type Status = (typeof statuses)[number]

export function StatusSelector({
  taskId,
  currentStatus,
  canChangeStatus = true,
}: {
  taskId: string
  currentStatus: string
  canChangeStatus?: boolean
}) {
  const [status, setStatus] = useState(currentStatus)

  const updateStatus = async (newStatus: Status) => {
    setStatus(newStatus)
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  if (!canChangeStatus) {
    return (
      <Badge
        variant={
          status === "TODO"
            ? "secondary"
            : status === "IN_PROGRESS"
              ? "default"
              : "outline"
        }
        className="text-xs"
      >
        {status.replace("_", " ")}
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {statuses.map((s) => (
        <Button
          key={s}
          variant={status === s ? "default" : "outline"}
          size="xs"
          onClick={() => updateStatus(s)}
          className="whitespace-nowrap px-1.5 h-6 text-[11px]"
        >
          {s.replace("_", " ")}
        </Button>
      ))}
    </div>
  )
}