import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dispatch } from "@/lib/notifications/NotificationDispatcher";
import { broadcast } from "@/lib/sse-manager";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const isMember = project.members.some((m) => m.userId === session.user.id);
  if (!isMember) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const members = project.members
    .filter((m) => m.userId !== project.owner.id)
    .map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
    }));

  const ownerEntry = {
    id: project.owner.id,
    name: project.owner.name,
    email: project.owner.email,
    role: "OWNER",
  };

  return NextResponse.json([ownerEntry, ...members]);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;
  const { email, role = "MEMBER" } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const validRoles = ["MEMBER", "MANAGER", "VIEWER"];
  if (!validRoles.includes(role)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
      { status: 400 }
    );
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: session.user.id,
        projectId,
      },
    },
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, name: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const isOwner = project.ownerId === session.user.id;
  const canManage = isOwner || membership?.role === "MANAGER";

  if (!canManage) {
    return NextResponse.json(
      { error: "Insufficient privileges" },
      { status: 403 }
    );
  }

  const userToAdd = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (!userToAdd) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: userToAdd.id,
        projectId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "User is already a member of this project" },
      { status: 409 }
    );
  }

  const newMember = await prisma.projectMember.create({
    data: {
      userId: userToAdd.id,
      projectId,
      role,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  dispatch({
    type: "ADDED_TO_PROJECT",
    userIds: [userToAdd.id],
    data: {
      projectId,
      actorId: session.user.id,
      role,
    },
  });

  broadcast("member-updated", { projectId });

  return NextResponse.json(
    {
      id: newMember.user.id,
      name: newMember.user.name,
      email: newMember.user.email,
      role: newMember.role,
    },
    { status: 201 }
  );
}