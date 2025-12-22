import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, description } = await req.json()
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Project name required" }, { status: 400 })
  }

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      ownerId: session.user.id,
      members: {
        create: { userId: session.user.id, role: "MANAGER" },
      },
    },
  })

  return NextResponse.json(project, { status: 201 })
}