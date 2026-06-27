'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { UserProfileMenu } from "@/components/user-profile-menu"
import { ECIRAPLogo } from "@/components/ecirap-logo"

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/leads", label: "Leads" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/revenue", label: "Revenue" },
]

export function TopBar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
      {/* Left: User Profile (Gmail Style) */}
      <div className="flex items-center gap-2">
        {user ? (
          <UserProfileMenu />
        ) : (
          <div className="flex items-center gap-2">
            <ECIRAPLogo size={20} />
            <span className="text-sm font-medium">ECIRAP</span>
          </div>
        )}
      </div>

      {/* Center: Mobile nav */}
      <nav className="flex gap-1 overflow-x-auto md:hidden">
        {nav.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Right: Logo/Title */}
      <div className="hidden items-center gap-2 md:flex">
        <ECIRAPLogo size={20} />
        <span className="text-sm font-medium">ECIRAP</span>
        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
          Enterprise
        </span>
      </div>
    </header>
  )
}
