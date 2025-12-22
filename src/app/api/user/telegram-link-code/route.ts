import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

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