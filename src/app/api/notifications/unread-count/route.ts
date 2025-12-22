import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { NotificationService } from "@/lib/notifications/NotificationService";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await NotificationService.countUnread(session.user.id);
  return NextResponse.json({ count });
}