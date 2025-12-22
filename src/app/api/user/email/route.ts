import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const EMAIL_CHANGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newEmail } = (await req.json()) as {
    currentPassword?: string;
    newEmail?: string;
  };

  if (!currentPassword || typeof currentPassword !== "string") {
    return NextResponse.json({ error: "Current password is required" }, { status: 400 });
  }

  if (!newEmail || typeof newEmail !== "string" || !newEmail.includes("@")) {
    return NextResponse.json({ error: "A valid new email is required" }, { status: 400 });
  }

  const normalizedNewEmail = newEmail.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true, lastEmailChange: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const passwordValid = await bcrypt.compare(currentPassword, user.password);
  if (!passwordValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  if (user.lastEmailChange) {
    const diff = Date.now() - user.lastEmailChange.getTime();
    if (diff < EMAIL_CHANGE_COOLDOWN_MS) {
      const remainingMs = EMAIL_CHANGE_COOLDOWN_MS - diff;
      const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      return NextResponse.json(
        {
          error: `Email can only be changed once per week. You can change it again in ${remainingDays} day(s).`,
        },
        { status: 429 }
      );
    }
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedNewEmail },
    select: { id: true },
  });

  if (existing && existing.id !== session.user.id) {
    return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      email: normalizedNewEmail,
      lastEmailChange: new Date(),
    },
  });

  return NextResponse.json({ success: true, email: normalizedNewEmail });
}