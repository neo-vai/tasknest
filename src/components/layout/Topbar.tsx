"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { RiSearchLine, RiMessage2Line } from "@remixicon/react";
import { SettingsMenu } from "@/components/SettingsMenu";
import { ThemeSubMenu } from "@/components/ThemeSubMenu";
import {
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SignOutMenuItem } from "@/components/SignOutMenuItem";
import { NotificationsBell } from "@/components/NotificationsBell";
import { TelegramLinkDialog } from "@/components/TelegramLinkDialog";

export function Topbar() {
  const [telegramOpen, setTelegramOpen] = useState(false);

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6">
      <div className="flex-1" />

      <div className="relative w-64">
        <RiSearchLine className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search..." className="h-8 pl-8 text-xs" />
      </div>

      <NotificationsBell />

      <SettingsMenu>
        <DropdownMenuItem onClick={() => setTelegramOpen(true)}>
          <RiMessage2Line className="h-4 w-4" />
          Link Telegram
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ThemeSubMenu />
        <DropdownMenuSeparator />
        <SignOutMenuItem />
      </SettingsMenu>

      <TelegramLinkDialog
        open={telegramOpen}
        onOpenChange={setTelegramOpen}
      />
    </header>
  );
}