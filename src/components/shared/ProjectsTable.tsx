"use client"

import { DataTable, type Column } from "./DataTable"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { RiArrowRightUpLine } from "@remixicon/react"

interface ProjectRow {
  id: string
  name: string
  description: string | null
  _count: { tasks: number; members: number }
  owner: { name?: string | null; email: string }
}

interface ProjectsTableProps {
  data: ProjectRow[]
}

const columns: Column<ProjectRow>[] = [
  {
    key: "name",
    header: "Project",
    cell: (project) => (
      <Link
        href={`/projects/${project.id}`}
        className="block font-medium text-sm hover:underline"
      >
        {project.name}
      </Link>
    ),
  },
  {
    key: "description",
    header: "Description",
    cell: (project) => (
      <p className="text-sm text-muted-foreground line-clamp-1">
        {project.description || "—"}
      </p>
    ),
  },
  {
    key: "tasks",
    header: "Tasks",
    cell: (project) => (
      <Badge variant="secondary" className="font-normal">
        {project._count.tasks}
      </Badge>
    ),
  },
  {
    key: "members",
    header: "Members",
    cell: (project) => (
      <span className="text-sm">{project._count.members}</span>
    ),
  },
  {
    key: "owner",
    header: "Owner",
    cell: (project) => (
      <span className="text-sm">
        {project.owner.name || project.owner.email.split("@")[0]}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    headerClassName: "w-10",
    cell: (project) => (
      <Link
        href={`/projects/${project.id}`}
        className="inline-flex items-center justify-center rounded-lg hover:bg-muted h-7 w-7"
      >
        <RiArrowRightUpLine className="h-4 w-4 text-muted-foreground" />
      </Link>
    ),
  },
]

export function ProjectsTable({ data }: ProjectsTableProps) {
  return <DataTable columns={columns} data={data} emptyMessage="No projects yet. Create your first one!" />
}