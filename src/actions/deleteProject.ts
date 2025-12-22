"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dispatch } from "@/lib/notifications/NotificationDispatcher";
import { broadcast } from "@/lib/sse-manager";
import { redirect } from "next/navigation";

export async function deleteProjectAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  const projectId = formData.get("projectId") as string;
  const memberUserIdsStr = formData.get("memberUserIds") as string;
  const memberUserIds = memberUserIdsStr
    ? memberUserIdsStr.split(",").filter(Boolean)
    : [];

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, name: true },
  });

  if (!project || project.ownerId !== session.user.id) {
    return;
  }

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
  redirect("/projects");
}