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

    const { id: scriptId } = await params
    const script = await prisma.script.findFirst({
      where: { id: scriptId, userId: session.user.id },
    })
    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    const sections = await prisma.scriptSection.findMany({
      where: { scriptId },
      orderBy: { order: "asc" },
    })

    const formatted = sections.map((s) => ({
      id: s.id,
      scriptId: s.scriptId,
      title: s.title,
      order: s.order,
      startOffset: s.startOffset,
      endOffset: s.endOffset,
      isCompleted: s.isCompleted,
      notes: s.notes,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching sections:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: scriptId } = await params
    const script = await prisma.script.findFirst({
      where: { id: scriptId, userId: session.user.id },
    })
    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    const body = await req.json()
    const { title, order, startOffset, endOffset, isCompleted, notes } = body

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const section = await prisma.scriptSection.create({
      data: {
        scriptId,
        title: title.trim(),
        order: typeof order === "number" ? order : 0,
        startOffset: typeof startOffset === "number" ? startOffset : null,
        endOffset: typeof endOffset === "number" ? endOffset : null,
        isCompleted: typeof isCompleted === "boolean" ? isCompleted : false,
        notes: typeof notes === "string" ? notes : null,
      },
    })

    return NextResponse.json({
      id: section.id,
      scriptId: section.scriptId,
      title: section.title,
      order: section.order,
      startOffset: section.startOffset,
      endOffset: section.endOffset,
      isCompleted: section.isCompleted,
      notes: section.notes,
      createdAt: section.createdAt.toISOString(),
      updatedAt: section.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error creating section:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
