import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dispatch } from "@/lib/notifications/NotificationDispatcher";
import { broadcast } from "@/lib/sse-manager";

async function getUserProjectRole(userId: string, projectId: string) {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  return member?.role ?? null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: { id: true, ownerId: true },
      },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const userId = session.user.id;
  const projectId = task.project.id;
  const isProjectOwner = task.project.ownerId === userId;
  const userRole = await getUserProjectRole(userId, projectId);

  if (!isProjectOwner && !userRole) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const isAuthor = task.authorId === userId;
  const isAssignee = task.assigneeId === userId;
  const isManagerOrOwner = isProjectOwner || userRole === "MANAGER";

  const { status, title, description, assigneeId: rawAssigneeId } = await req.json();
  const assigneeId = rawAssigneeId !== undefined ? rawAssigneeId : undefined;

  const updateData: Record<string, unknown> = {};

  if (status !== undefined) {
    const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (status === "DONE") {
      if (!isAssignee && !isManagerOrOwner) {
        return NextResponse.json(
          { error: "Only the assignee or a manager can complete this task" },
          { status: 403 }
        );
      }
    } else {
      if (!isAuthor && !isAssignee && !isManagerOrOwner) {
        return NextResponse.json(
          { error: "You can't change the status of this task" },
          { status: 403 }
        );
      }
    }

    updateData.status = status;
  }

  if (title !== undefined || description !== undefined) {
    if (!isAuthor && !isManagerOrOwner) {
      return NextResponse.json(
        { error: "You can't edit this task" },
        { status: 403 }
      );
    }

    if (
      isAuthor &&
      !isManagerOrOwner &&
      task.assigneeId &&
      task.assigneeId !== userId &&
      task.status === "IN_PROGRESS"
    ) {
      return NextResponse.json(
        { error: "You can't edit this task while it's in progress and assigned to someone else" },
        { status: 403 }
      );
    }

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
  }

  if (assigneeId !== undefined) {
    if (!isAuthor && !isManagerOrOwner) {
      return NextResponse.json(
        { error: "You can't change the assignee" },
        { status: 403 }
      );
    }
    if (assigneeId) {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: assigneeId,
            projectId,
          },
        },
      });
      if (!assigneeMember) {
        return NextResponse.json(
          { error: "Assignee is not a project member" },
          { status: 400 }
        );
      }
    }
    updateData.assigneeId = assigneeId;
  }

  const oldStatus = task.status;
  const oldAssigneeId = task.assigneeId;

  if (Object.keys(updateData).length > 0) {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
        author: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    if (status && oldStatus !== status) {
      if (status === "DONE") {
        const recipients = new Set<string>();
        if (task.authorId) recipients.add(task.authorId);
        if (task.assigneeId) recipients.add(task.assigneeId);
        recipients.delete(userId);
        if (recipients.size > 0) {
          dispatch({
            type: "TASK_COMPLETED",
            userIds: Array.from(recipients),
            data: {
              projectId,
              taskId,
              actorId: userId,
              taskTitle: updatedTask.title,
            },
          });
        }
      } else if (oldStatus === "DONE" && (status === "TODO" || status === "IN_PROGRESS")) {
        const recipients = new Set<string>();
        if (task.authorId) recipients.add(task.authorId);
        if (task.assigneeId) recipients.add(task.assigneeId);
        recipients.delete(userId);
        if (recipients.size > 0) {
          dispatch({
            type: "TASK_REOPENED",
            userIds: Array.from(recipients),
            data: {
              projectId,
              taskId,
              actorId: userId,
              taskTitle: updatedTask.title,
            },
          });
        }
      }
    }

    if (assigneeId !== undefined && oldAssigneeId !== assigneeId) {
      if (assigneeId && assigneeId !== userId) {
        dispatch({
          type: "TASK_ASSIGNED",
          userIds: [assigneeId],
          data: {
            projectId,
            taskId,
            actorId: userId,
            taskTitle: updatedTask.title,
          },
        });
      }
      if (oldAssigneeId && oldAssigneeId !== userId && oldAssigneeId !== assigneeId) {
        dispatch({
          type: "TASK_UNASSIGNED",
          userIds: [oldAssigneeId],
          data: {
            projectId,
            taskId,
            actorId: userId,
            taskTitle: updatedTask.title,
          },
        });
      }
    }

    broadcast("task-updated", { taskId, projectId });

    return NextResponse.json(updatedTask);
  }

  return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: { select: { id: true, ownerId: true } },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (task.status !== "TODO") {
    return NextResponse.json(
      { error: "Only tasks with status TODO can be deleted" },
      { status: 400 }
    );
  }

  const userId = session.user.id;
  const projectId = task.project.id;
  const isProjectOwner = task.project.ownerId === userId;
  const userRole = await getUserProjectRole(userId, projectId);
  const isAuthor = task.authorId === userId;
  const isManagerOrOwner = isProjectOwner || userRole === "MANAGER";

  if (!isAuthor && !isManagerOrOwner) {
    return NextResponse.json(
      { error: "You don't have permission to delete this task" },
      { status: 403 }
    );
  }

  await prisma.task.delete({ where: { id: taskId } });

  const recipients = new Set<string>();
  if (task.assigneeId && task.assigneeId !== userId) recipients.add(task.assigneeId);
  if (task.authorId && task.authorId !== userId) recipients.add(task.authorId);
  if (recipients.size > 0) {
    dispatch({
      type: "TASK_DELETED",
      userIds: Array.from(recipients),
      data: {
        projectId,
        taskId,
        actorId: userId,
        taskTitle: task.title,
      },
    });
  }

  broadcast("task-deleted", { taskId, projectId });

  return NextResponse.json({ success: true });
}