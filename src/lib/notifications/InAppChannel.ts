import type { NotificationChannel } from "./NotificationChannel";
import type { DispatchEvent } from "./types";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { broadcast } from "@/lib/sse-manager";

export class InAppChannel implements NotificationChannel {
  async send(event: DispatchEvent) {
    const { type, userIds, data } = event;
    const meta = data as Record<string, unknown>;

    const title = getTitle(type, meta);
    const message = getMessage(type, meta);

    const create = userIds.map((userId) =>
      prisma.notification
        .create({
          data: {
            userId,
            type,
            title,
            message,
            metadata: data as Prisma.InputJsonValue,
          },
          select: { id: true },
        })
        .catch(() => null)
    );

    await Promise.all(create);

    broadcast("notification", { type, userIds });
  }
}

function getTitle(type: string, data: Record<string, unknown>) {
  switch (type) {
    case "ADDED_TO_PROJECT":
      return "Added to project";
    case "REMOVED_FROM_PROJECT":
      return "Removed from project";
    case "ROLE_CHANGED":
      return "Role changed";
    case "TASK_ASSIGNED":
      return "New task assigned";
    case "TASK_UNASSIGNED":
      return "Unassigned from task";
    case "TASK_COMPLETED":
      return "Task completed";
    case "TASK_REOPENED":
      return "Task reopened";
    case "TASK_DELETED":
      return "Task deleted";
    case "PROJECT_DELETED":
      return "Project deleted";
    default:
      return "Notification";
  }
}

function getMessage(type: string, data: Record<string, unknown>) {
  const taskTitle = data.taskTitle ? `"${data.taskTitle}"` : "a task";
  const projectName = data.projectName ? `"${data.projectName}"` : "a project";
  switch (type) {
    case "ADDED_TO_PROJECT":
      return "You have been added to the project.";
    case "REMOVED_FROM_PROJECT":
      return "You have been removed from the project.";
    case "ROLE_CHANGED":
      return `Your role was changed to ${data.role ?? "unknown"}.`;
    case "TASK_ASSIGNED":
      return `You have been assigned to ${taskTitle}.`;
    case "TASK_UNASSIGNED":
      return `You have been unassigned from ${taskTitle}.`;
    case "TASK_COMPLETED":
      return `${taskTitle} has been marked as completed.`;
    case "TASK_REOPENED":
      return `${taskTitle} has been reopened.`;
    case "TASK_DELETED":
      return `${taskTitle} has been deleted.`;
    case "PROJECT_DELETED":
      return `${projectName} has been deleted.`;
    default:
      return "You have a new notification.";
  }
}