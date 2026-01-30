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
    const script = await prisma.script.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        projectLinks: { select: { projectId: true } },
      },
    })

    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: script.id,
      name: script.name,
      content: script.content,
      bulletContent: script.bulletContent ?? null,
      cueContent: script.cueContent ?? null,
      status: script.status as "draft" | "ready" | "completed",
      createdAt: script.createdAt.toISOString(),
      updatedAt: script.updatedAt.toISOString(),
      storageType: "cloud" as const,
      projectIds: script.projectLinks.map((pl) => pl.projectId),
      isPinned: script.isPinned,
      parentScriptId: script.parentScriptId,
      variantType: script.variantType,
      lastRecordedAt: script.lastRecordedAt?.toISOString() ?? null,
      lastRehearsedAt: script.lastRehearsedAt?.toISOString() ?? null,
      rehearsalCount: script.rehearsalCount,
    })
  } catch (error) {
    console.error("Error fetching script:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
    const { name, content, status, isPinned, bulletContent, cueContent } = body

    // Verify script belongs to user
    const existingScript = await prisma.script.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingScript) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    const data: Record<string, unknown> = {
      ...(name !== undefined && { name: name.trim() }),
      ...(content !== undefined && { content }),
      ...(status !== undefined && { status }),
      ...(typeof isPinned === "boolean" && { isPinned }),
      ...(bulletContent !== undefined && { bulletContent: bulletContent ?? null }),
      ...(cueContent !== undefined && { cueContent: cueContent ?? null }),
    }
    if (status === "completed") {
      data.lastRecordedAt = new Date()
    }
    const script = await prisma.script.update({
      where: { id },
      data,
      include: { projectLinks: { select: { projectId: true } } },
    })

    return NextResponse.json({
      id: script.id,
      name: script.name,
      content: script.content,
      bulletContent: script.bulletContent ?? null,
      cueContent: script.cueContent ?? null,
      status: script.status as "draft" | "ready" | "completed",
      createdAt: script.createdAt.toISOString(),
      updatedAt: script.updatedAt.toISOString(),
      storageType: "cloud" as const,
      projectIds: script.projectLinks.map((pl) => pl.projectId),
      isPinned: script.isPinned,
      parentScriptId: script.parentScriptId,
      variantType: script.variantType,
      lastRecordedAt: script.lastRecordedAt?.toISOString() ?? null,
      lastRehearsedAt: script.lastRehearsedAt?.toISOString() ?? null,
      rehearsalCount: script.rehearsalCount,
    })
  } catch (error) {
    console.error("Error updating script:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    // Verify script belongs to user
    const existingScript = await prisma.script.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingScript) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    await prisma.script.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting script:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
