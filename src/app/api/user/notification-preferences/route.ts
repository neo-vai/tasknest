import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await prisma.userNotificationPreference.findMany({
    where: { userId: session.user.id },
    select: { type: true, enabled: true },
  });

  return NextResponse.json(preferences);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { type: string; enabled: boolean }[];

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const operations = body.map(({ type, enabled }) =>
    prisma.userNotificationPreference.upsert({
      where: {
        userId_type: {
          userId: session.user.id,
          type: type as any,
        },
      },
      create: {
        userId: session.user.id,
        type: type as any,
        enabled,
      },
      update: { enabled },
    })
  );

  await prisma.$transaction(operations);

  return NextResponse.json({ success: true });
}