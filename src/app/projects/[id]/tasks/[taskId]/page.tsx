import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { dispatch } from "@/lib/notifications/NotificationDispatcher";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskStatusActions } from "@/components/TaskStatusActions";
import { AssigneeSelector } from "@/components/AssigneeSelector";
import { EditTaskForm } from "@/components/EditTaskForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RiArrowLeftLine, RiUser3Line, RiDeleteBinLine } from "@remixicon/react";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: projectId, taskId } = await params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          ownerId: true,
          members: { select: { userId: true, role: true } },
        },
      },
      author: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  if (!task || task.project.id !== projectId) notFound();

  const userId = session.user.id;
  const isProjectOwner = task.project.ownerId === userId;
  const membership = task.project.members.find((m) => m.userId === userId);
  const userRole = isProjectOwner ? "OWNER" : membership?.role ?? null;

  if (!membership && !isProjectOwner) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-sm text-muted-foreground">You are not a member of this project.</p>
        </div>
      </DashboardShell>
    );
  }

  const isAuthor = task.authorId === userId;
  const isAssignee = task.assigneeId === userId;
  const isManagerOrOwner = isProjectOwner || userRole === "MANAGER";

  const canEditBase = isAuthor || isManagerOrOwner;
  const canEdit =
    canEditBase &&
    !(
      isAuthor &&
      !isManagerOrOwner &&
      task.assigneeId &&
      task.assigneeId !== userId &&
      task.status === "IN_PROGRESS"
    );

  const canComplete = isAssignee || isManagerOrOwner;
  const canChangeStatus = isAuthor || isAssignee || isManagerOrOwner;
  const canChangeAssignee = isAuthor || isManagerOrOwner;

  const canDelete = (isAuthor || isManagerOrOwner) && task.status === "TODO";

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-2">
          <Link href={`/projects/${projectId}`}>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <RiArrowLeftLine className="h-4 w-4" />
              Back to project
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{task.title}</CardTitle>
              {task.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <RiUser3Line className="h-4 w-4" />
                  <span>Author: {task.author?.name || task.author?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Assignee:</span>
                  {canChangeAssignee ? (
                    <AssigneeSelector
                      projectId={projectId}
                      taskId={task.id}
                      currentAssigneeId={task.assigneeId}
                      canChange={canChangeAssignee}
                    />
                  ) : (
                    <span>
                      {task.assignee?.name || task.assignee?.email || "Unassigned"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TaskStatusActions
                taskId={task.id}
                status={task.status}
                canChangeStatus={canChangeStatus}
                canComplete={canComplete}
              />
              {canDelete && (
                <DeleteTaskButton projectId={projectId} taskId={task.id} />
              )}
            </div>
          </CardHeader>
        </Card>

        {canEdit && (
          <EditTaskForm
            taskId={task.id}
            initialTitle={task.title}
            initialDescription={task.description || ""}
          />
        )}
      </div>
    </DashboardShell>
  );
}

function DeleteTaskButton({
  projectId,
  taskId,
}: {
  projectId: string;
  taskId: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          suppressHydrationWarning
          className="text-destructive hover:text-destructive"
        >
          <RiDeleteBinLine className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this task? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form
            action={async () => {
              "use server";
              const session = await auth();
              if (!session?.user?.id) {
                return;
              }

              const task = await prisma.task.findUnique({
                where: { id: taskId },
                select: {
                  id: true,
                  status: true,
                  title: true,
                  projectId: true,
                  authorId: true,
                  assigneeId: true,
                  project: { select: { ownerId: true } },
                },
              });

              if (!task || task.status !== "TODO") {
                return;
              }

              const userId = session.user.id;

              const userRole = await prisma.projectMember
                .findUnique({
                  where: {
                    userId_projectId: {
                      userId,
                      projectId: task.projectId,
                    },
                  },
                  select: { role: true },
                })
                .then((m) => m?.role ?? null);

              const isProjectOwner = task.project.ownerId === userId;
              const isAuthor = task.authorId === userId;
              const isManagerOrOwner = isProjectOwner || userRole === "MANAGER";

              if (!isAuthor && !isManagerOrOwner) {
                return;
              }

              await prisma.task.delete({ where: { id: taskId } });

              const recipients = new Set<string>();
              if (task.assigneeId && task.assigneeId !== userId)
                recipients.add(task.assigneeId);
              if (task.authorId && task.authorId !== userId)
                recipients.add(task.authorId);

              if (recipients.size > 0) {
                await dispatch({
                  type: "TASK_DELETED",
                  userIds: Array.from(recipients),
                  data: {
                    projectId: task.projectId,
                    taskId,
                    actorId: userId,
                    taskTitle: task.title,
                  },
                });
              }

              redirect(`/projects/${projectId}`);
            }}
          >
            <AlertDialogAction type="submit" variant="destructive">
              Delete
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}