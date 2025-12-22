"use client"

import { Input } from "@/components/ui/input"
import { RiSearchLine, RiNotificationLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { SettingsMenu } from "@/components/SettingsMenu"
import { ThemeSubMenu } from "@/components/ThemeSubMenu"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { SignOutMenuItem } from "@/components/SignOutMenuItem"
import { NotificationsBell } from "@/components/NotificationsBell"

export function Topbar() {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6">
      <div className="flex-1" />

      <div className="relative w-64">
        <RiSearchLine className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="h-8 pl-8 text-xs"
        />
      </div>

      <NotificationsBell />

      <SettingsMenu>
        <ThemeSubMenu />
        <DropdownMenuSeparator />
        <SignOutMenuItem />
      </SettingsMenu>
    </header>
  )
}