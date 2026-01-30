import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

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

    const updated = await prisma.script.update({
      where: { id: scriptId },
      data: {
        lastRehearsedAt: new Date(),
        rehearsalCount: { increment: 1 },
      },
      include: { projectLinks: { select: { projectId: true } } },
    })

    return NextResponse.json({
      id: updated.id,
      lastRehearsedAt: updated.lastRehearsedAt?.toISOString() ?? null,
      rehearsalCount: updated.rehearsalCount,
    })
  } catch (error) {
    console.error("Error recording rehearsal:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
