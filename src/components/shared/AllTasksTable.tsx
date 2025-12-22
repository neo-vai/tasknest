"use client"

import { DataTable, type Column } from "./DataTable"
import { TaskStatusActions } from "@/components/TaskStatusActions"
import Link from "next/link"

interface TaskRow {
  id: string
  title: string
  description: string | null
  status: string
  project: { id: string; name: string }
  author: { name?: string | null; email: string } | null
  assignee: { name?: string | null; email: string } | null
  canChangeStatus: boolean
}

interface AllTasksTableProps {
  data: TaskRow[]
}

const columns: Column<TaskRow>[] = [
  {
    key: "title",
    header: "Task",
    cell: (task) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-sm">
          <Link href={`/projects/${task.project.id}/tasks/${task.id}`} className="hover:underline">
            {task.title}
          </Link>
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
        )}
        <Link
          href={`/projects/${task.project.id}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-0.5"
        >
          <span className="truncate">{task.project.name}</span>
        </Link>
      </div>
    ),
  },
  {
    key: "author",
    header: "Author",
    cell: (task) => (
      <span className="text-sm text-muted-foreground">
        {task.author?.name || task.author?.email?.split("@")[0] || "—"}
      </span>
    ),
  },
  {
    key: "assignee",
    header: "Assignee",
    cell: (task) => (
      <span className="text-sm text-muted-foreground">
        {task.assignee?.name || task.assignee?.email?.split("@")[0] || "—"}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    headerClassName: "w-32",
    cell: (task) => (
      <TaskStatusActions taskId={task.id} status={task.status} canChangeStatus={task.canChangeStatus} size="sm" />
    ),
  },
]

export function AllTasksTable({ data }: AllTasksTableProps) {
  return <DataTable columns={columns} data={data} emptyMessage="No tasks assigned or created by you yet." />
}