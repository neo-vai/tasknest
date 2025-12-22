import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dispatch } from "@/lib/notifications/NotificationDispatcher";
import { broadcast } from "@/lib/sse-manager";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: session.user.id,
        projectId,
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  if (membership.role === "VIEWER") {
    return NextResponse.json(
      { error: "You don't have permission to create tasks" },
      { status: 403 }
    );
  }

  const { title, description, assigneeId } = await req.json();
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (assigneeId) {
    const assigneeMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: assigneeId,
          projectId,
        },
      },
    });
    if (!assigneeMembership) {
      return NextResponse.json(
        { error: "Assignee is not a project member" },
        { status: 400 }
      );
    }
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      projectId,
      authorId: session.user.id,
      assigneeId: assigneeId || null,
    },
  });

  if (task.assigneeId && task.assigneeId !== session.user.id) {
    dispatch({
      type: "TASK_ASSIGNED",
      userIds: [task.assigneeId],
      data: {
        projectId,
        taskId: task.id,
        actorId: session.user.id,
        taskTitle: task.title,
      },
    });
  }

  broadcast("task-created", { projectId, taskId: task.id });

  return NextResponse.json(task, { status: 201 });
}