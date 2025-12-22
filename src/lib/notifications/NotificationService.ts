import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export class NotificationService {
  static async filterEnabledUsers(
    type: NotificationType,
    userIds: string[]
  ): Promise<string[]> {
    const disabled = await prisma.userNotificationPreference.findMany({
      where: {
        userId: { in: userIds },
        type,
        enabled: false,
      },
      select: { userId: true },
    });

    const disabledSet = new Set(disabled.map((p) => p.userId));
    return userIds.filter((id) => !disabledSet.has(id));
  }

  static async getForUser(
    userId: string,
    options: {
      unreadOnly?: boolean;
      cursor?: string;
      limit?: number;
    } = {}
  ) {
    const { unreadOnly, cursor, limit = 20 } = options;
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
}