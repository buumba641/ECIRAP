"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Building2, Moon, Sun, Menu, X, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/accounts", label: "Accounts" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/leads", label: "Leads" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/quotations", label: "Quotations" },
  { href: "/invoices", label: "Invoices" },
  { href: "/revenue", label: "Revenue" },
  { href: "/products", label: "Products" },
  { href: "/assurance", label: "Assurance" },
]

type Profile = {
  full_name: string
  role: string
}

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()
      if (data) setProfile(data)
    })
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    document.documentElement.classList.toggle("light", !next)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
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
