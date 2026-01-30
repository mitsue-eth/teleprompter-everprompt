import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const scripts = await prisma.script.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        projectLinks: { select: { projectId: true } },
      },
    })

    // Convert to JSON-serializable format
    const formattedScripts = scripts.map((script) => ({
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
    }))

    return NextResponse.json(formattedScripts)
  } catch (error) {
    console.error("Error fetching scripts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, content, status, parentScriptId, variantType } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const script = await prisma.script.create({
      data: {
        name: name.trim(),
        content: content || "",
        status: status || "draft",
        userId: session.user.id,
        ...(parentScriptId && typeof parentScriptId === "string" && { parentScriptId }),
        ...(variantType && typeof variantType === "string" && { variantType }),
      },
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
      projectIds: [],
      isPinned: script.isPinned,
      parentScriptId: script.parentScriptId,
      variantType: script.variantType,
    })
  } catch (error) {
    console.error("Error creating script:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
