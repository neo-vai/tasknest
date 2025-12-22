"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  RiDashboardLine,
  RiFolderLine,
  RiTaskLine,
} from "@remixicon/react"
import { useUserProfile } from "@/hooks/useUser"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: RiDashboardLine },
  { name: "Projects", href: "/projects", icon: RiFolderLine },
  { name: "My Tasks", href: "/tasks", icon: RiTaskLine },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { data: profile, isLoading: isProfileLoading } = useUserProfile()

  const isAuthLoading = status === "loading"
  const user = session?.user

  const displayName =
    profile?.name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User"
  const displayEmail = profile?.email || user?.email || ""
  const avatarLetter = (displayName[0] || "U").toUpperCase()
  const isLoading =
    isAuthLoading || (isProfileLoading && !profile)

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground">
          T
        </div>
        <span className="text-base font-semibold">TaskNest</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navigation.map(({ name, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link key={name} href={href} className="block">
              <Button
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2.5 h-9 px-3 text-sm font-normal",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {name}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {isLoading ? "..." : avatarLetter}
          </div>
          <div className="flex-1 truncate text-sm">
            {isLoading ? (
              <>
                <p className="truncate font-medium">...</p>
                <p className="truncate text-xs text-muted-foreground">
                  ...
                </p>
              </>
            ) : (
              <>
                <p className="truncate font-medium">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {displayEmail}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}