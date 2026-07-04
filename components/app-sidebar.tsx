"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Megaphone,
  Users,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Radar,
  Package,
  Building2,
  FileText,
  Receipt,
  UserCog,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"

type NavItem = {
  href: string
  label: string
  icon: typeof LayoutDashboard
  roles?: string[] // if undefined, visible to all roles
}

const allNav: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Building2 },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone, roles: ["CEO", "Manager", "Marketing", "Analyst"] },
  { href: "/leads", label: "Leads", icon: Users, roles: ["CEO", "Manager", "Sales", "Marketing"] },
  { href: "/pipeline", label: "Pipeline", icon: TrendingUp, roles: ["CEO", "Manager", "Sales", "Analyst"] },
  { href: "/quotations", label: "Quotations", icon: FileText, roles: ["CEO", "Manager", "Sales", "Accountant"] },
  { href: "/invoices", label: "Invoices", icon: Receipt, roles: ["CEO", "Manager", "Accountant"] },
  { href: "/revenue", label: "Revenue & ROI", icon: Wallet, roles: ["CEO", "Manager", "Accountant", "Analyst"] },
  { href: "/products", label: "Products", icon: Package },
  { href: "/assurance", label: "Assurance", icon: ShieldCheck, roles: ["CEO", "Manager", "Analyst"] },
  { href: "/admin/users", label: "User Management", icon: UserCog, roles: ["HR", "CEO"] },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Fetch current employee's role from the employees table
    const supabase = createClient()
    fetch("/api/me")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.role) setUserRole(data.role)
      })
      .catch(() => {})
  }, [])

  // Filter nav items based on role
  const nav = allNav.filter(
    (item) => !item.roles || !userRole || item.roles.includes(userRole),
  )

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Radar className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">ECIRAP</p>
          <p className="text-[11px] text-sidebar-foreground/60">
            Commercial Intelligence
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
          Operations
        </p>
        <ul className="flex flex-col gap-1">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {userRole && (
          <div className="mt-4 rounded-md bg-sidebar-accent/30 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40">Your Role</p>
            <p className="text-sm font-semibold text-sidebar-primary">{userRole}</p>
          </div>
        )}
      </nav>

      <div className="mx-3 mb-4 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
        <div className="flex items-center gap-2 text-sidebar-primary">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-semibold">Revenue Assurance</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/60">
          Continuous monitoring for leakage across leads, contracts & cash.
        </p>
      </div>
    </aside>
  )
}
