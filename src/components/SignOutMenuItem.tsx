"use client"

import { signOut } from "next-auth/react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { RiLogoutBoxRLine } from "@remixicon/react"

export function SignOutMenuItem() {
  return (
    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
      <RiLogoutBoxRLine className="h-4 w-4" />
      Sign Out
    </DropdownMenuItem>
  )
}