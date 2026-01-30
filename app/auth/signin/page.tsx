"use client"

import * as React from "react"
import { Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, CheckCircle2, ArrowLeft, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Logo } from "@/components/logo"

type SignInState = "form" | "sent"

function SignInForm() {
  const [email, setEmail] = React.useState("")
  const [sentEmail, setSentEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [state, setState] = React.useState<SignInState>("form")
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const error = searchParams.get("error")

  // Show error from NextAuth (e.g., expired link)
  React.useEffect(() => {
    if (error === "Verification") {
      toast.error("This magic link has expired. Please request a new one.")
    } else if (error) {
      toast.error("Something went wrong. Please try again.")
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    setIsLoading(true)
    try {
      const result = await signIn("email", {
        email: email.trim(),
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        toast.error("Failed to send magic link. Please try again.")
      } else {
        setSentEmail(email.trim())
        setState("sent")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = () => {
    setEmail(sentEmail)
    setState("form")
  }

  const handleUseAnother = () => {
    setEmail("")
    setSentEmail("")
    setState("form")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="flex flex-col items-center mb-8">
          <Logo variant="icon" size={56} className="mb-4" />
          <h1 className="text-2xl font-bold text-foreground">EverPrompt</h1>
          <p className="text-sm text-muted-foreground">Professional tools for content creators</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
          {state === "form" ? (
            <>
              {/* Form Header */}
              <div className="px-8 pt-8 pb-6 text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Sign in to your account
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a magic link
                </p>
              </div>

              {/* Form */}
              <div className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoFocus
                      required
                      className="h-11"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send magic link
                      </>
                    )}
                  </Button>
                </form>

                {/* Info */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 mt-0.5 text-purple-500 shrink-0" />
                    <p>
                      No password needed. We'll email you a secure link that logs you in instantly.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Email Sent State */}
              <div className="px-8 py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Check your email
                </h2>
                
                <p className="text-sm text-muted-foreground mb-2">
                  We sent a magic link to
                </p>
                
                <p className="text-base font-medium text-foreground mb-6">
                  {sentEmail}
                </p>

                <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">What's next?</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Open the email we just sent you</li>
                    <li>• Click the "Sign in" button</li>
                    <li>• You'll be logged in automatically</li>
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground mb-6">
                  The link expires in 24 hours. Check your spam folder if you don't see it.
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={handleTryAgain}
                    className="w-full"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Resend to {sentEmail.split('@')[0]}@...
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleUseAnother}
                    className="w-full text-muted-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Use a different email
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-muted animate-pulse mb-4" />
            <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
