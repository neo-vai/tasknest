import type { DispatchEvent } from "./types";

export interface NotificationChannel {
  send(event: DispatchEvent): Promise<void>;
}