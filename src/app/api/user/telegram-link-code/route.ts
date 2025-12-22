import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { telegramChatId: true },
  });

  const linked = !!user?.telegramChatId;

  const existing = await prisma.telegramLinkCode.findFirst({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    select: { code: true, expiresAt: true },
  });

  if (existing) {
    return NextResponse.json({
      code: existing.code,
      expiresAt: existing.expiresAt.toISOString(),
      linked,
    });
  }

  return NextResponse.json({ code: null, expiresAt: null, linked });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const existingActive = await prisma.telegramLinkCode.findFirst({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
  });

  if (existingActive) {
    return NextResponse.json({
      code: existingActive.code,
      expiresAt: existingActive.expiresAt.toISOString(),
    });
  }

  const code = randomBytes(3)
    .readUIntBE(0, 3)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0")
    .slice(0, 6);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.telegramLinkCode.deleteMany({
    where: { userId },
  });

  await prisma.telegramLinkCode.create({
    data: {
      code,
      userId,
      expiresAt,
    },
  });

  return NextResponse.json({ code, expiresAt: expiresAt.toISOString() });
}