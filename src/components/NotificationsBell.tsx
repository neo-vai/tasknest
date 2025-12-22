"use client";

import { useNotificationsList, useUnreadCount, useMarkAllAsRead, useMarkAsRead } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiNotificationLine, RiCheckLine } from "@remixicon/react";
import Link from "next/link";

export function NotificationsBell() {
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notifications = [] } = useNotificationsList(10);
  const markAllAsRead = useMarkAllAsRead();
  const markAsRead = useMarkAsRead();

  const getLink = (notification: { metadata: Record<string, unknown> | null }) => {
    const m = notification.metadata as Record<string, unknown> | null;
    if (m?.projectId && m?.taskId) {
      return `/projects/${m.projectId}/tasks/${m.taskId}`;
    }
    if (m?.projectId) {
      return `/projects/${m.projectId}`;
    }
    return "/tasks";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <RiNotificationLine className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => markAllAsRead.mutate()}
              className="text-xs gap-1"
            >
              <RiCheckLine className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-xs text-muted-foreground p-3 text-center">
              No new notifications
            </p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                href={getLink(n)}
                onClick={() => {
                  if (!n.isRead) markAsRead.mutate(n.id);
                }}
                className="flex flex-col gap-0.5 px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{n.title}</span>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{n.message}</p>
              </Link>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}