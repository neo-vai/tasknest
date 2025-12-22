import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewTaskForm } from "@/components/NewTaskForm";
import { TaskStatusActions } from "@/components/TaskStatusActions";
import { AddMemberForm } from "@/components/AddMemberForm";
import { MemberList } from "@/components/MemberList";
import {
  RiArrowLeftLine,
  RiTaskLine,
  RiUser3Line,
} from "@remixicon/react";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!project) notFound();

  const isMember = project.members.some((m) => m.userId === session.user.id);
  if (!isMember) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-6xl">
          <PageHeader title="Access Denied" description="You don't have access to this project." />
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <RiArrowLeftLine className="h-4 w-4" />
              Back to projects
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const isOwner = project.ownerId === session.user.id;
  const currentUserRole = (() => {
    if (isOwner) return "OWNER";
    const member = project.members.find((m) => m.userId === session.user.id);
    return member?.role || null;
  })();

  const canCreateTask = isOwner || currentUserRole === "MANAGER" || currentUserRole === "MEMBER";

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHeader title={project.name} description={project.description || undefined}>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <RiArrowLeftLine className="h-4 w-4" />
              Projects
            </Button>
          </Link>
        </PageHeader>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {canCreateTask && <NewTaskForm projectId={project.id} />}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>
                    {project.tasks.length} total tasks
                  </CardDescription>
                </div>
                <RiTaskLine className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {project.tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
                      <RiTaskLine className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No tasks yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create a new task to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {project.tasks.map((task) => {
                      const canChangeStatus =
                        isOwner ||
                        currentUserRole === "MANAGER" ||
                        task.authorId === session.user.id ||
                        task.assigneeId === session.user.id;
                      const canComplete =
                        isOwner ||
                        currentUserRole === "MANAGER" ||
                        task.assigneeId === session.user.id;
                      return (
                        <div
                          key={task.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-sm font-medium truncate">
                              <Link href={`/projects/${project.id}/tasks/${task.id}`} className="hover:underline">
                                {task.title}
                              </Link>
                            </p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <RiUser3Line className="h-3 w-3" />
                                {task.author?.name || "Unknown"}
                              </span>
                              {task.assignee && (
                                <span className="inline-flex items-center gap-1">
                                  &rarr; {task.assignee.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <TaskStatusActions
                              taskId={task.id}
                              status={task.status}
                              canChangeStatus={canChangeStatus}
                              canComplete={canComplete}
                              size="sm"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team</CardTitle>
                  {(currentUserRole === "OWNER" || currentUserRole === "MANAGER") && (
                    <AddMemberForm projectId={project.id} />
                  )}
                </div>
                <CardDescription>
                  Manage project members and roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MemberList
                  projectId={project.id}
                  currentUserId={session.user.id}
                  currentUserRole={currentUserRole}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}