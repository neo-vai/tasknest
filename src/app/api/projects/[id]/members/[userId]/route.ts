import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dispatch } from "@/lib/notifications/NotificationDispatcher";
import { broadcast } from "@/lib/sse-manager";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, userId } = await params;
  const { role } = await req.json();

  const validRoles = ["MEMBER", "MANAGER", "VIEWER"];
  if (!role || !validRoles.includes(role)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, name: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const isOwner = project.ownerId === session.user.id;
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: session.user.id,
        projectId,
      },
    },
  });

  const canManage = isOwner || membership?.role === "MANAGER";
  if (!canManage) {
    return NextResponse.json(
      { error: "Insufficient privileges" },
      { status: 403 }
    );
  }

  if (project.ownerId === userId) {
    return NextResponse.json(
      { error: "Cannot change owner's role" },
      { status: 403 }
    );
  }

  const targetMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!targetMember) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const updated = await prisma.projectMember.update({
    where: {
      userId_projectId: { userId, projectId },
    },
    data: { role },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  dispatch({
    type: "ROLE_CHANGED",
    userIds: [userId],
    data: {
      projectId,
      actorId: session.user.id,
      role: updated.role,
    },
  });

  broadcast("member-updated", { projectId });

  return NextResponse.json({
    id: updated.user.id,
    name: updated.user.name,
    email: updated.user.email,
    role: updated.role,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, userId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, name: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const isOwner = project.ownerId === session.user.id;
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: session.user.id,
        projectId,
      },
    },
  });

  const canManage = isOwner || membership?.role === "MANAGER";
  if (!canManage) {
    return NextResponse.json(
      { error: "Insufficient privileges" },
      { status: 403 }
    );
  }

  if (project.ownerId === userId) {
    return NextResponse.json(
      { error: "Cannot remove project owner" },
      { status: 403 }
    );
  }

  await prisma.projectMember.delete({
    where: {
      userId_projectId: { userId, projectId },
    },
  });

  dispatch({
    type: "REMOVED_FROM_PROJECT",
    userIds: [userId],
    data: {
      projectId,
      actorId: session.user.id,
    },
  });

  broadcast("member-removed", { projectId });

  return NextResponse.json({ success: true });
}