"use client"

import { DataTable, type Column } from "./DataTable"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { RiArrowRightUpLine } from "@remixicon/react"

interface TaskRow {
  id: string
  title: string
  project: { id: string; name: string }
  status: string
  assignee: { name?: string | null; email: string } | null
}

interface RecentTasksTableProps {
  data: TaskRow[]
}

const columns: Column<TaskRow>[] = [
  {
    key: "title",
    header: "Task",
    cell: (task) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-sm">{task.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {task.project?.name ?? "—"}
        </p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (task) => (
      <Badge
        variant={
          task.status === "TODO"
            ? "secondary"
            : task.status === "IN_PROGRESS"
              ? "default"
              : "outline"
        }
        className="text-xs"
      >
        {task.status.replace("_", " ")}
      </Badge>
    ),
  },
  {
    key: "assignee",
    header: "Assignee",
    cell: (task) => (
      <span className="text-sm">
        {task.assignee?.name ?? task.assignee?.email?.split("@")[0] ?? "—"}
      </span>
    ),
  },
  {
    key: "action",
    header: "",
    headerClassName: "w-10",
    cell: (task) => (
      <Link
        href={`/projects/${task.project?.id}`}
        className="inline-flex items-center justify-center rounded-lg hover:bg-muted h-7 w-7"
      >
        <RiArrowRightUpLine className="h-4 w-4 text-muted-foreground" />
      </Link>
    ),
  },
]

export function RecentTasksTable({ data }: RecentTasksTableProps) {
  return <DataTable columns={columns} data={data} emptyMessage="No tasks yet." />
}