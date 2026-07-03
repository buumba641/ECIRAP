import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// ─── Role-Based Route Access Map ─────────────────────────────────────────────
// Routes not listed here are accessible to ALL authenticated users.
const ROUTE_ACCESS: Record<string, string[]> = {
  "/campaigns":   ["CEO", "Manager", "Marketing", "Analyst"],
  "/leads":       ["CEO", "Manager", "Sales", "Marketing"],
  "/pipeline":    ["CEO", "Manager", "Sales", "Analyst"],
  "/quotations":  ["CEO", "Manager", "Sales", "Accountant"],
  "/invoices":    ["CEO", "Manager", "Accountant"],
  "/revenue":     ["CEO", "Manager", "Accountant", "Analyst"],
  "/assurance":   ["CEO", "Manager", "Analyst"],
  "/admin":       ["HR", "CEO"],
}

function getRequiredRoles(pathname: string): string[] | null {
  // Check exact match first, then prefix match
  for (const [route, roles] of Object.entries(ROUTE_ACCESS)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return roles
    }
  }
  return null // No restriction — open to all authenticated users
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // If Supabase env vars are missing, skip auth entirely
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.warn("[middleware] Supabase env vars not set — skipping auth")
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh the session with a timeout to prevent hanging
  let user = null
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Auth timeout")), 5000),
      ),
    ])
    user = result.data?.user ?? null
  } catch (err) {
    console.error("[middleware] Auth check failed:", err)
    // On auth failure, let the request through (pages will render with empty data)
    return supabaseResponse
  }

  // Redirect /signup to /login (signup is removed)
  if (request.nextUrl.pathname.startsWith("/signup")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  const isAuthPage = request.nextUrl.pathname.startsWith("/login")

  // If not logged in and not on the login page, redirect to login
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // If logged in and on the login page, redirect to dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // ─── Role-Based Access Check ─────────────────────────────────────────────
  if (user) {
    const requiredRoles = getRequiredRoles(request.nextUrl.pathname)

    if (requiredRoles) {
      // Fetch user's role from profile
      let userRole: string | null = null
      try {
        const { data } = await Promise.race([
          supabase.from("profiles").select("role").eq("id", user.id).single(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Profile query timeout")), 3000),
          ),
        ])
        userRole = data?.role ?? null
      } catch {
        console.error("[middleware] Profile fetch failed, allowing access")
        return supabaseResponse
      }

      // If we got a role and it's not in the allowed list, redirect to dashboard
      if (userRole && !requiredRoles.includes(userRole)) {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        url.searchParams.set("unauthorized", "1")
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.*|apple-icon.*|placeholder.*).*)",
  ],
}
