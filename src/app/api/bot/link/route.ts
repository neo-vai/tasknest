import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_LINK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { code, chatId } = body;

  if (typeof code !== "string" || code.length !== 6) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  if (typeof chatId !== "number" || !Number.isInteger(chatId)) {
    return NextResponse.json({ error: "Invalid chatId" }, { status: 400 });
  }

  const linkCode = await prisma.telegramLinkCode.findUnique({
    where: { code },
  });

  if (!linkCode) {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }

  if (linkCode.expiresAt < new Date()) {
    await prisma.telegramLinkCode.delete({ where: { id: linkCode.id } });
    return NextResponse.json({ error: "Code expired" }, { status: 410 });
  }

  const userId = linkCode.userId;

  const chatIdStr = String(chatId);

  const existing = await prisma.user.findFirst({
    where: { telegramChatId: chatIdStr, NOT: { id: userId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Telegram account already linked to another user" }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      telegramChatId: chatIdStr,
      telegramLinkedAt: new Date(),
    },
  });

  await prisma.telegramLinkCode.delete({ where: { id: linkCode.id } });

  return NextResponse.json({ success: true, userId });
}