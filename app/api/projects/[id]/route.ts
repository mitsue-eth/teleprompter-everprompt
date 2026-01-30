import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
      include: {
        scriptLinks: {
          include: { script: true },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      icon: project.icon,
      isArchived: project.isArchived,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      scriptCount: project.scriptLinks.length,
      scriptIds: project.scriptLinks.map((ps) => ps.scriptId),
      scripts: project.scriptLinks.map((ps) => ({
        id: ps.script.id,
        name: ps.script.name,
        status: ps.script.status,
        order: ps.order,
      })),
    })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, description, color, icon, isArchived } = body

    const existing = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(typeof name === "string" && name.trim() && { name: name.trim() }),
        ...(description !== undefined && {
          description:
            typeof description === "string" ? description.trim() || null : null,
        }),
        ...(color !== undefined && {
          color: typeof color === "string" ? color : null,
        }),
        ...(icon !== undefined && {
          icon: typeof icon === "string" ? icon : null,
        }),
        ...(typeof isArchived === "boolean" && { isArchived }),
      },
      include: {
        scriptLinks: {
          include: { script: true },
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      icon: project.icon,
      isArchived: project.isArchived,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      scriptCount: project.scriptLinks.length,
      scriptIds: project.scriptLinks.map((ps) => ps.scriptId),
    })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
