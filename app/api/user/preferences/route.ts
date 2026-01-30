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

    let prefs = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    })
    if (!prefs) {
      prefs = await prisma.userPreferences.create({
        data: { userId: session.user.id },
      })
    }

    return NextResponse.json({
      lastExportedAt: prefs.lastExportedAt?.toISOString() ?? null,
      exportReminderDays: prefs.exportReminderDays,
      showExportReminder: prefs.showExportReminder,
      defaultScriptView: prefs.defaultScriptView,
      defaultStorage: prefs.defaultStorage,
    })
  } catch (error) {
    console.error("Error fetching preferences:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      lastExportedAt,
      exportReminderDays,
      showExportReminder,
      defaultScriptView,
      defaultStorage,
    } = body

    const prefs = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...(typeof lastExportedAt === "string" && { lastExportedAt: new Date(lastExportedAt) }),
        ...(typeof exportReminderDays === "number" && { exportReminderDays }),
        ...(typeof showExportReminder === "boolean" && { showExportReminder }),
        ...(typeof defaultScriptView === "string" && { defaultScriptView }),
        ...(typeof defaultStorage === "string" && { defaultStorage }),
      },
      update: {
        ...(typeof lastExportedAt === "string" && { lastExportedAt: new Date(lastExportedAt) }),
        ...(typeof exportReminderDays === "number" && { exportReminderDays }),
        ...(typeof showExportReminder === "boolean" && { showExportReminder }),
        ...(typeof defaultScriptView === "string" && { defaultScriptView }),
        ...(typeof defaultStorage === "string" && { defaultStorage }),
      },
    })

    return NextResponse.json({
      lastExportedAt: prefs.lastExportedAt?.toISOString() ?? null,
      exportReminderDays: prefs.exportReminderDays,
      showExportReminder: prefs.showExportReminder,
      defaultScriptView: prefs.defaultScriptView,
      defaultStorage: prefs.defaultStorage,
    })
  } catch (error) {
    console.error("Error updating preferences:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
