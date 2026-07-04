"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Building2, Moon, Sun, Menu, X, LogOut,
  LayoutDashboard, Megaphone, Users, TrendingUp,
  Wallet, ShieldCheck, Package, FileText, Receipt, UserCog,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { logout } from "@/lib/auth"

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
  { href: "/revenue", label: "Revenue", icon: Wallet, roles: ["CEO", "Manager", "Accountant", "Analyst"] },
  { href: "/products", label: "Products", icon: Package },
  { href: "/assurance", label: "Assurance", icon: ShieldCheck, roles: ["CEO", "Manager", "Analyst"] },
  { href: "/admin/users", label: "Users", icon: UserCog, roles: ["HR", "CEO"] },
]

type EmployeeInfo = {
  full_name: string
  role: string
}

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState<EmployeeInfo | null>(null)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))

    // Fetch current employee info from API
    fetch("/api/me")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setProfile({ full_name: data.full_name, role: data.role })
      })
      .catch(() => {})
  }, [])

  // Filter nav based on user role
  const nav = allNav.filter(
    (item) => !item.roles || !profile?.role || item.roles.includes(profile.role),
  )

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    document.documentElement.classList.toggle("light", !next)
  }

  async function handleLogout() {
    await logout()
    router.push("/login")
    router.refresh()
  }

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?"

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Infratel Zambia</span>
        <span className="hidden rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground sm:inline">
          Enterprise
        </span>
      </div>

      {menuOpen && (
        <div className="absolute left-0 top-16 z-50 w-full border-b border-border bg-background p-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={toggleDark}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent transition-colors"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          onClick={handleLogout}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>

        <div className="hidden items-center gap-3 md:flex">
          <div className="text-right leading-tight">
            <p className="text-xs font-medium">{profile?.full_name ?? "Loading…"}</p>
            <p className="text-[11px] text-muted-foreground">{profile?.role ?? ""}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
