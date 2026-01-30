"use client";

import * as React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, LogIn, LogOut, User, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const AVATAR_STORAGE_KEY = "teleprompter-user-avatar";

// Fun avatar options for content creators
const AVATAR_OPTIONS = [
  { id: "axolotl", emoji: "🦎", label: "Axolotl" },
  { id: "fox", emoji: "🦊", label: "Clever Fox" },
  { id: "owl", emoji: "🦉", label: "Wise Owl" },
  { id: "cat", emoji: "🐱", label: "Creative Cat" },
  { id: "rocket", emoji: "🚀", label: "Rocket Star" },
  { id: "sparkles", emoji: "✨", label: "Sparkle Creator" },
  { id: "microphone", emoji: "🎙️", label: "Voice Pro" },
  { id: "camera", emoji: "📹", label: "Video Creator" },
] as const;

type AvatarId = (typeof AVATAR_OPTIONS)[number]["id"] | "initials";

export function AuthStatus() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [selectedAvatar, setSelectedAvatar] =
    React.useState<AvatarId>("initials");

  // Load saved avatar preference
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (
        saved &&
        (saved === "initials" || AVATAR_OPTIONS.some((a) => a.id === saved))
      ) {
        setSelectedAvatar(saved as AvatarId);
      }
    } catch (error) {
      console.error("Failed to load avatar preference:", error);
    }
  }, []);

  const handleAvatarChange = (avatarId: AvatarId) => {
    setSelectedAvatar(avatarId);
    try {
      localStorage.setItem(AVATAR_STORAGE_KEY, avatarId);
    } catch (error) {
      console.error("Failed to save avatar preference:", error);
    }
  };

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirect: false });
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (status === "loading") {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!session) {
    return (
      <Button variant="ghost" size="sm" onClick={handleSignIn}>
        <LogIn className="mr-2 h-4 w-4" />
        Sign in
      </Button>
    );
  }

  const userInitials =
    session.user?.email?.split("@")[0].substring(0, 2).toUpperCase() || "U";

  const getAvatarDisplay = () => {
    if (selectedAvatar === "initials") {
      return userInitials;
    }
    const avatar = AVATAR_OPTIONS.find((a) => a.id === selectedAvatar);
    return avatar?.emoji || userInitials;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 cursor-pointer"
        >
          <Avatar className="h-8 w-8">
            {session.user?.image && selectedAvatar === "initials" && (
              <AvatarImage
                src={session.user.image}
                alt={session.user.name || ""}
              />
            )}
            <AvatarFallback className="text-base">
              {getAvatarDisplay()}
            </AvatarFallback>
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Change avatar
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem
              onClick={() => handleAvatarChange("initials")}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium">{userInitials}</span>
                <span>Initials</span>
              </span>
              {selectedAvatar === "initials" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {AVATAR_OPTIONS.map((avatar) => (
              <DropdownMenuItem
                key={avatar.id}
                onClick={() => handleAvatarChange(avatar.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{avatar.emoji}</span>
                  <span>{avatar.label}</span>
                </span>
                {selectedAvatar === avatar.id && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isSigningOut}
          onClick={handleSignOut}
          className="cursor-pointer"
        >
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
  );
}
