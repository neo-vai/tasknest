import type { NotificationType } from "@prisma/client";

export interface NotificationData {
  projectId?: string;
  taskId?: string;
  actorId?: string;
  role?: string;
  taskTitle?: string;
  projectName?: string;
}

export interface DispatchEvent {
  type: NotificationType;
  userIds: string[];
  data: NotificationData;
}