"use client"

import * as React from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, LogIn, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"

export function AuthStatus() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  const handleSignIn = () => {
    router.push("/auth/signin")
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ redirect: false })
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  if (status === "loading") {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (!session) {
    return (
      <Button variant="ghost" size="sm" onClick={handleSignIn}>
        <LogIn className="mr-2 h-4 w-4" />
        Sign in
      </Button>
    )
  }

  const userInitials = session.user?.email
    ?.split("@")[0]
    .substring(0, 2)
    .toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            {session.user?.image && (
              <AvatarImage src={session.user.image} alt={session.user.name || ""} />
            )}
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user?.name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isSigningOut} onClick={handleSignOut}>
          {isSigningOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
