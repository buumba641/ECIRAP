import { NextResponse, type NextRequest } from "next/server"
import { SignJWT, jwtVerify } from "jose"

// ─── Session Config ──────────────────────────────────────────────────────────
const SESSION_COOKIE = "ecirap-session"

function getSecret() {
  const secret = process.env.SESSION_SECRET || "ecirap-default-dev-secret-change-me"
  return new TextEncoder().encode(secret)
}

type SessionPayload = {
  id: string
  email: string
  full_name: string
  role: string
  branch: string
}

async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// ─── Role-Based Route Access Map ─────────────────────────────────────────────
// Routes not listed here are accessible to ALL authenticated users.
const ROUTE_ACCESS: Record<string, string[]> = {
  // ── Existing routes (corrected) ──────────────────────────────
  "/campaigns":         ["CEO", "Manager", "Marketing", "Analyst"],
  "/leads":             ["CEO", "Manager", "Sales", "Marketing"],
  "/pipeline":          ["CEO", "Manager", "Sales", "TeamLead", "Analyst"],
  "/quotations":        ["CEO", "Manager", "Sales", "Accountant"],
  "/invoices":          ["CEO", "Manager", "Sales", "Accountant", "Cashier"],
  "/revenue":           ["CEO", "Manager", "Accountant", "Analyst", "Marketing"],
  "/products":          ["CEO", "Manager", "Cashier", "Analyst"],
  "/assurance":         ["CEO", "Manager", "Analyst"],
  "/accounts":          ["CEO", "Manager"],
  "/admin":             ["HR", "CEO"],
  // ── New routes ───────────────────────────────────────────────
  "/payment-approvals": ["CEO", "Manager"],
  "/my-customers":      ["Sales"],
  "/my-revenue":        ["Sales"],
  "/team-performance":  ["TeamLead"],
  "/payroll":           ["CEO", "Accountant"],
  "/cash-handover":     ["CEO", "Accountant", "Cashier"],
  "/system-health":     ["IT"],
  "/change-requests":   ["IT", "CEO"],
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
  const { pathname } = request.nextUrl

  // Redirect /signup to /login (signup is removed)
  if (pathname.startsWith("/signup")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  const isAuthPage = pathname.startsWith("/login")

  // Get session from JWT cookie
  const session = await getSessionFromRequest(request)

  // If not logged in and not on the login page, redirect to login
  if (!session && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // If logged in and on the login page, redirect to dashboard
  if (session && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // ─── Role-Based Access Check ─────────────────────────────────────────────
  if (session) {
    const requiredRoles = getRequiredRoles(pathname)

    if (requiredRoles && !requiredRoles.includes(session.role)) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      url.searchParams.set("unauthorized", "1")
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
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
