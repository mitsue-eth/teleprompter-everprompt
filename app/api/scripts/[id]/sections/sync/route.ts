import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function parseHeadingsFromMarkdown(content: string): { title: string; order: number; startOffset: number; endOffset: number }[] {
  const sections: { title: string; order: number; startOffset: number; endOffset: number }[] = []
  const lines = content.split("\n")
  let order = 0
  let currentStart = 0
  let pos = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const title = match[2].trim()
      if (level >= 2) {
        sections.push({
          title,
          order: order++,
          startOffset: pos,
          endOffset: pos + line.length,
        })
      }
    }
    pos += line.length + (i < lines.length - 1 ? 1 : 0)
  }

  return sections
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
      include: { sections: true },
    })
    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    const parsed = parseHeadingsFromMarkdown(script.content)
    const existingByOrder = new Map(script.sections.map((s) => [s.order, s]))

    const results = []
    for (let i = 0; i < parsed.length; i++) {
      const p = parsed[i]
      const existing = existingByOrder.get(p.order)
      if (existing) {
        const updated = await prisma.scriptSection.update({
          where: { id: existing.id },
          data: {
            title: p.title,
            startOffset: p.startOffset,
            endOffset: p.endOffset,
          },
        })
        results.push({
          id: updated.id,
          title: updated.title,
          order: updated.order,
          startOffset: updated.startOffset,
          endOffset: updated.endOffset,
          isCompleted: updated.isCompleted,
          notes: updated.notes,
        })
      } else {
        const created = await prisma.scriptSection.create({
          data: {
            scriptId,
            title: p.title,
            order: p.order,
            startOffset: p.startOffset,
            endOffset: p.endOffset,
          },
        })
        results.push({
          id: created.id,
          title: created.title,
          order: created.order,
          startOffset: created.startOffset,
          endOffset: created.endOffset,
          isCompleted: created.isCompleted,
          notes: created.notes,
        })
      }
    }

    const toDelete = script.sections.filter((s) => s.order >= parsed.length)
    for (const s of toDelete) {
      await prisma.scriptSection.delete({ where: { id: s.id } })
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error syncing sections:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
