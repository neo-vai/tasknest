"use client";

import { useState } from "react";
import { SettingsMenu } from "@/components/SettingsMenu";
import { ThemeSubMenu } from "@/components/ThemeSubMenu";
import {
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SignOutMenuItem } from "@/components/SignOutMenuItem";
import { NotificationsBell } from "@/components/NotificationsBell";
import { TelegramLinkDialog } from "@/components/TelegramLinkDialog";
import { SearchBar } from "@/components/SearchBar";
import { RiMessage2Line } from "@remixicon/react";

export function Topbar() {
  const [telegramOpen, setTelegramOpen] = useState(false);

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6">
      <div className="flex-1" />

      <SearchBar />

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