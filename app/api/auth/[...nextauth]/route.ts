import NextAuth from "next-auth"
import type { Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import EmailProvider from "next-auth/providers/email"
import { Resend } from "resend"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const providers = [
  EmailProvider({
    from: process.env.EMAIL_FROM || "noreply@example.com",
    sendVerificationRequest: async ({ identifier, url }) => {
      if (!resend || !process.env.EMAIL_FROM) {
        throw new Error("RESEND_API_KEY and EMAIL_FROM are required. Set them in your environment.")
      }
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: identifier,
        subject: "Sign in to EverPrompt",
        html: `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; margin-bottom: 20px;">Sign in to EverPrompt</h1>
            <p style="color: #666; margin-bottom: 30px;">Click the link below to sign in to your account:</p>
            <a href="${url}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Sign in</a>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
            <p style="color: #999; font-size: 14px; margin-top: 10px;">If you didn't request this email, you can safely ignore it.</p>
          </div>
        `,
      })
      if (error) throw new Error(error.message)
    },
  }),
]

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const, maxAge: 30 * 24 * 60 * 60 }, // 30 days
  providers,
  callbacks: {
    async jwt({ token, user, trigger }: { token: JWT; user?: { id: string }; trigger?: string }) {
      if (user?.id) {
        token.id = user.id
        // Fetch plan data when user signs in
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { plan: true, planExpiresAt: true },
        })
        if (dbUser) {
          token.plan = dbUser.plan as "free" | "pro"
          token.planExpiresAt = dbUser.planExpiresAt?.toISOString() || null
        }
      }
      // Refresh plan data on session update
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true, planExpiresAt: true },
        })
        if (dbUser) {
          token.plan = dbUser.plan as "free" | "pro"
          token.planExpiresAt = dbUser.planExpiresAt?.toISOString() || null
        }
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        ;(session.user as { id?: string; plan?: string; planExpiresAt?: string | null }).id = token.id as string
        ;(session.user as { plan?: string }).plan = token.plan || "free"
        ;(session.user as { planExpiresAt?: string | null }).planExpiresAt = token.planExpiresAt || null
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
