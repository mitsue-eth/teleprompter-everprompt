import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: scriptId, sectionId } = await params
    const section = await prisma.scriptSection.findFirst({
      where: { id: sectionId, scriptId },
      include: { script: true },
    })
    if (!section || section.script.userId !== session.user.id) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 })
    }

    const body = await req.json()
    const { title, order, startOffset, endOffset, isCompleted, notes } = body

    const updated = await prisma.scriptSection.update({
      where: { id: sectionId },
      data: {
        ...(typeof title === "string" && title.trim() && { title: title.trim() }),
        ...(typeof order === "number" && { order }),
        ...(startOffset !== undefined && { startOffset: typeof startOffset === "number" ? startOffset : null }),
        ...(endOffset !== undefined && { endOffset: typeof endOffset === "number" ? endOffset : null }),
        ...(typeof isCompleted === "boolean" && { isCompleted }),
        ...(notes !== undefined && { notes: typeof notes === "string" ? notes : null }),
      },
    })

    return NextResponse.json({
      id: updated.id,
      scriptId: updated.scriptId,
      title: updated.title,
      order: updated.order,
      startOffset: updated.startOffset,
      endOffset: updated.endOffset,
      isCompleted: updated.isCompleted,
      notes: updated.notes,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error updating section:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: scriptId, sectionId } = await params
    const section = await prisma.scriptSection.findFirst({
      where: { id: sectionId, scriptId },
      include: { script: true },
    })
    if (!section || section.script.userId !== session.user.id) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 })
    }

    await prisma.scriptSection.delete({ where: { id: sectionId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting section:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
