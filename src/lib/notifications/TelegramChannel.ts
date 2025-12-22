import type { NotificationChannel } from "./NotificationChannel";
import type { DispatchEvent } from "./types";
import { prisma } from "@/lib/prisma";

const INTERNAL_HOST =
  process.env.TELEGRAM_BOT_INTERNAL_HOST || "http://127.0.0.1";
const INTERNAL_PORT =
  process.env.TELEGRAM_BOT_INTERNAL_PORT || "4000";
const SECRET = process.env.TELEGRAM_LINK_SECRET || "";

async function sendTelegramMessage(chatId: string, text: string) {
  if (!SECRET) {
    console.error("TELEGRAM_LINK_SECRET not set, cannot send Telegram notification");
    return;
  }
  try {
    const url = `${INTERNAL_HOST}:${INTERNAL_PORT}/send`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SECRET}`,
      },
      body: JSON.stringify({ chatId: Number(chatId), text }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Telegram proxy send failed", response.status, err);
    }
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

function getBaseMessage(type: string, data: Record<string, unknown>): string {
  const taskTitle = data.taskTitle ? `"${String(data.taskTitle)}"` : "a task";
  const projectName = data.projectName ? `"${String(data.projectName)}"` : "a project";
  switch (type) {
    case "ADDED_TO_PROJECT":
      return "you have been added to a project.";
    case "REMOVED_FROM_PROJECT":
      return "you have been removed from a project.";
    case "ROLE_CHANGED":
      return `your role was changed to ${data.role ?? "unknown"}.`;
    case "TASK_ASSIGNED":
      return `you have been assigned to ${taskTitle}.`;
    case "TASK_UNASSIGNED":
      return `you have been unassigned from ${taskTitle}.`;
    case "TASK_COMPLETED":
      return `${taskTitle} has been marked as completed.`;
    case "TASK_REOPENED":
      return `${taskTitle} has been reopened.`;
    case "TASK_DELETED":
      return `${taskTitle} has been deleted.`;
    case "PROJECT_DELETED":
      return `${projectName} has been deleted.`;
    default:
      return "you have a new notification.";
  }
}

export class TelegramChannel implements NotificationChannel {
  async send(event: DispatchEvent) {
    const { type, userIds, data } = event;
    const meta = data as Record<string, unknown>;
    const baseMessage = getBaseMessage(type, meta);

    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        telegramChatId: { not: null },
      },
      select: { id: true, telegramChatId: true, name: true, email: true },
    });

    const sendPromises = users
      .filter((u) => u.telegramChatId)
      .map((u) => {
        const displayName = u.name || u.email || "User";
        const text = `${displayName}, ${baseMessage}`;
        return sendTelegramMessage(u.telegramChatId!, text);
      });

    await Promise.allSettled(sendPromises);
  }
}