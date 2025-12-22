"use client"

import { useTheme } from "next-themes"
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { RiCheckLine, RiComputerLine, RiSunLine, RiMoonLine, RiPaletteLine } from "@remixicon/react"
import { cn } from "@/lib/utils"

const themes = [
  { key: "system", label: "System", icon: RiComputerLine },
  { key: "light", label: "Light", icon: RiSunLine },
  { key: "dark", label: "Dark", icon: RiMoonLine },
] as const

export function ThemeSubMenu() {
  const { theme, setTheme } = useTheme()
  const current = theme ?? "system"

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2">
        <RiPaletteLine className="h-4 w-4" />
        Theme
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-[8rem]">
        {themes.map(({ key, label, icon: Icon }) => {
          const isActive = current === key
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => setTheme(key)}
              className={cn(
                "flex items-center justify-between gap-2",
                isActive && "text-primary font-semibold"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              {isActive && <RiCheckLine className="h-4 w-4" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}