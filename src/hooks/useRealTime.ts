"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

const SSE_EVENTS = [
  "task-updated",
  "task-created",
  "task-deleted",
  "member-updated",
  "member-removed",
  "notification",
] as const;

export function useRealTime() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!session?.user) {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      return;
    }

    const eventSource = new EventSource("/api/sse");
    eventSourceRef.current = eventSource;

    const handler = (event: MessageEvent) => {
      try {
        switch (event.type) {
          case "task-updated":
          case "task-created":
          case "task-deleted":
            queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
            queryClient.invalidateQueries({ queryKey: ["project"], exact: false });
            break;
          case "member-updated":
          case "member-removed":
            queryClient.invalidateQueries({ queryKey: ["project"], exact: false });
            break;
          case "notification":
            queryClient.invalidateQueries({ queryKey: ["notifications"], exact: false });
            break;
        }
      } catch {
        
      }
    };

    for (const eventName of SSE_EVENTS) {
      eventSource.addEventListener(eventName, handler);
    }

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [session, queryClient]);
}