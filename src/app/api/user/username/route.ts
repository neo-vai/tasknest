import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newName } = (await req.json()) as {
    currentPassword?: string;
    newName?: string;
  };

  if (!currentPassword || typeof currentPassword !== "string") {
    return NextResponse.json({ error: "Current password is required" }, { status: 400 });
  }

  if (newName === undefined || newName === null || typeof newName !== "string") {
    return NextResponse.json({ error: "New name is required" }, { status: 400 });
  }

  const trimmedName = newName.trim();
  if (trimmedName.length === 0) {
    return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const passwordValid = await bcrypt.compare(currentPassword, user.password);
  if (!passwordValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: trimmedName },
  });

  return NextResponse.json({ success: true, name: trimmedName });
}