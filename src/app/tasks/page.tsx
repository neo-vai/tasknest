import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { PageHeader } from "@/components/shared/PageHeader"
import { AllTasksTable } from "@/components/shared/AllTasksTable"

export default async function TasksPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assigneeId: session.user.id },
        { assigneeId: null, authorId: session.user.id },
      ],
    },
    include: {
      project: { select: { id: true, name: true } },
      author: { select: { name: true, email: true } },
      assignee: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const tasksWithPermissions = tasks.map(task => ({
    ...task,
    canChangeStatus: true,
  }))

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHeader
          title="My Tasks"
          description="All tasks assigned to or created by you"
        />
        <AllTasksTable data={tasksWithPermissions} />
      </div>
    </DashboardShell>
  )
}