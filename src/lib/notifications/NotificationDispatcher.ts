import type { DispatchEvent } from "./types";
import { InAppChannel } from "./InAppChannel";
import { TelegramChannel } from "./TelegramChannel";
import { NotificationService } from "./NotificationService";
import type { NotificationChannel } from "./NotificationChannel";

const channels: NotificationChannel[] = [new InAppChannel(), new TelegramChannel()];

export async function dispatch(event: DispatchEvent) {
  const { userIds } = event;

  const enabledUserIds = await NotificationService.filterEnabledUsers(
    event.type,
    userIds
  );
  if (enabledUserIds.length === 0) return;

  const filteredEvent: DispatchEvent = {
    ...event,
    userIds: enabledUserIds,
  };

  const promises = channels.map((channel) => channel.send(filteredEvent));
  await Promise.allSettled(promises);
}