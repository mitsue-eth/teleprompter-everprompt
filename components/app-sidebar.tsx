"use client"

import * as React from "react"
import {
  IconCamera,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react"

import { Logo } from "@/components/logo"
import { SidebarBackground } from "@/components/sidebar-background"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Teleprompter",
    url: "/",
    icon: IconCamera,
  },
]

const secondaryItems = [
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
  },
  {
    title: "Help",
    url: "#",
    icon: IconHelp,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <div className="relative h-full">
        <SidebarBackground />
        
        <SidebarHeader className="relative z-10 border-b border-sidebar-border/50 px-6 py-6">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="h-auto p-0 hover:bg-transparent data-[slot=sidebar-menu-button]:!p-0"
              >
                <a href="/" className="flex items-center gap-3 group">
                  <div className="relative">
                    <Logo variant="icon" className="!size-8 transition-transform group-hover:scale-105" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
                      EverPrompt
                    </span>
                    <span className="text-xs text-sidebar-foreground/60 font-normal">
                      Teleprompter
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="relative z-10 px-4 py-6">
          <div className="space-y-1">
            {navItems.map((item) => (
              <SidebarMenu key={item.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === "/"}
                    className={cn(
                      "h-11 w-full justify-start gap-3 rounded-lg px-4",
                      "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                      "hover:bg-sidebar-accent/50 transition-colors"
                    )}
                  >
                    <a href={item.url}>
                      {item.icon && <item.icon className="size-5" />}
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ))}
          </div>
        </SidebarContent>

        <SidebarFooter className="relative z-10 border-t border-sidebar-border/50 px-4 py-4">
          <div className="space-y-1">
            {secondaryItems.map((item) => (
              <SidebarMenu key={item.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-10 w-full justify-start gap-3 rounded-lg px-4",
                      "text-sidebar-foreground/60 hover:text-sidebar-foreground/80",
                      "hover:bg-sidebar-accent/30 transition-colors",
                      "text-sm"
                    )}
                  >
                    <a href={item.url}>
                      {item.icon && <item.icon className="size-4" />}
                      <span className="text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ))}
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}
