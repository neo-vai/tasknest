import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { NotificationService } from "@/lib/notifications/NotificationService";

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await NotificationService.markAllAsRead(session.user.id);
  return NextResponse.json({ success: true });
}