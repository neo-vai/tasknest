import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProjectsTable } from "@/components/shared/ProjectsTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RiAddLine } from "@remixicon/react"

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const projects = await prisma.project.findMany({
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
  })

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHeader
          title="Projects"
          description="Manage and browse all your projects"
        >
          <Link href="/projects/new">
            <Button size="sm" className="gap-1.5">
              <RiAddLine className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </PageHeader>

        <ProjectsTable data={projects} />
      </div>
    </DashboardShell>
  )
}