import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export function useUnreadCount() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok) return 0;
      const data = await res.json();
      return data.count as number;
    },
    enabled: !!session?.user,
    refetchInterval: 60_000,
  });
}

export function useNotificationsList(limit = 10) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["notifications", "list", { limit }],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?unreadOnly=true&limit=${limit}`);
      if (!res.ok) return [];
      return (await res.json()) as Notification[];
    },
    enabled: !!session?.user,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}