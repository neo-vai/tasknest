import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dispatch } from "@/lib/notifications/NotificationDispatcher";
import { broadcast } from "@/lib/sse-manager";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      members: {
        select: { userId: true },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Only project owner can delete the project" }, { status: 403 });
  }

  const memberUserIds = project.members.map((m) => m.userId).filter((id) => id !== session.user.id);

  await prisma.project.delete({ where: { id: projectId } });

  if (memberUserIds.length > 0) {
    await dispatch({
      type: "PROJECT_DELETED",
      userIds: memberUserIds,
      data: {
        projectId,
        projectName: project.name,
        actorId: session.user.id,
      },
    });
  }

  broadcast("project-deleted", { projectId });

  return NextResponse.json({ success: true });
}