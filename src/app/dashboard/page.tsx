import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatsCard } from "@/components/shared/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RecentTasksTable } from "@/components/shared/RecentTasksTable"
import {
  RiFolderLine,
  RiTaskLine,
  RiCheckDoubleLine,
  RiTimeLine,
  RiAddLine,
  RiArrowRightUpLine,
} from "@remixicon/react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [projectsCount, tasksStats, recentProjects, recentTasks] =
    await Promise.all([
      prisma.project.count({
        where: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id } } },
          ],
        },
      }),
      prisma.task.groupBy({
        by: ["status"],
        where: {
          OR: [
            { assigneeId: session.user.id },
            { assigneeId: null, authorId: session.user.id },
          ],
        },
        _count: { status: true },
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id } } },
          ],
        },
        include: {
          owner: { select: { name: true, email: true } },
          _count: { select: { tasks: true, members: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.task.findMany({
        where: {
          OR: [
            { assigneeId: session.user.id },
            { assigneeId: null, authorId: session.user.id },
          ],
        },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

  const statusCounts: Record<string, number> = {}
  tasksStats.forEach((g) => {
    statusCounts[g.status] = g._count.status
  })

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHeader
          title="Dashboard"
          description={`Welcome back, ${session.user.name || session.user.email}`}
        >
          <Link href="/projects/new">
            <Button size="sm" className="gap-1.5">
              <RiAddLine className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </PageHeader>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatsCard
            label="Projects"
            value={projectsCount}
            icon={RiFolderLine}
          />
          <StatsCard
            label="To Do"
            value={statusCounts["TODO"] ?? 0}
            icon={RiTaskLine}
          />
          <StatsCard
            label="In Progress"
            value={statusCounts["IN_PROGRESS"] ?? 0}
            icon={RiTimeLine}
          />
          <StatsCard
            label="Done"
            value={statusCounts["DONE"] ?? 0}
            icon={RiCheckDoubleLine}
          />
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Projects</h2>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="gap-1.5 h-7 px-2">
                View all
                <RiArrowRightUpLine className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <Card size="sm">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No projects yet.{" "}
                <Link href="/projects/new" className="text-primary hover:underline">
                  Create one
                </Link>
                .
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card
                    size="sm"
                    className="h-full transition-colors hover:ring-2 hover:ring-primary/20"
                  >
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold truncate">
                        {project.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {project.description ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {project.description}
                        </p>
                      ) : (
                        <p className="text-xs italic text-muted-foreground">
                          No description
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {project._count.tasks} tasks
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {project._count.members} members
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Owner: {project.owner.name ?? project.owner.email}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Tasks</h2>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="gap-1.5 h-7 px-2">
                View all
                <RiArrowRightUpLine className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <RecentTasksTable data={recentTasks} />
        </section>
      </div>
    </DashboardShell>
  )
}