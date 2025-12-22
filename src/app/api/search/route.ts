import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ projects: [], tasks: [] });
  }

  const query = q.trim();

  const [projects, projectIds] = await Promise.all([
    prisma.project.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
        AND: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        _count: { select: { tasks: true, members: true } },
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      select: { id: true },
    }),
  ]);

  const accessibleProjectIds = projectIds.map((p) => p.id);

  const tasks = await prisma.task.findMany({
    where: {
      projectId: { in: accessibleProjectIds },
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      project: {
        select: { id: true, name: true },
      },
    },
    take: 5,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ projects, tasks });
}