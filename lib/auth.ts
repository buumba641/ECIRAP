"use server"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// ─── Configuration ───────────────────────────────────────────
const SESSION_COOKIE = "ecirap-session"
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days in seconds

function getSecret() {
  const secret = process.env.SESSION_SECRET || "ecirap-default-dev-secret-change-me"
  return new TextEncoder().encode(secret)
}

// ─── Session Types ───────────────────────────────────────────
export type SessionPayload = {
  id: string
  email: string
  full_name: string
  role: string
  branch: string
}

// ─── Create Session (JWT) ────────────────────────────────────
async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret())
}

// ─── Verify Session (JWT) ────────────────────────────────────
async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// ─── Login ───────────────────────────────────────────────────
export async function login(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  // Use a plain supabase-js client (not SSR) to avoid cookie conflicts
  // during Server Action invocation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const authKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseKey

  if (!supabaseUrl || !supabaseKey || !authKey) {
    console.error("[login] Missing Supabase env vars:", {
      supabaseUrl: !!supabaseUrl,
      supabaseKey: !!supabaseKey,
      authKey: !!authKey,
    })
    return { success: false, error: "Server configuration error. Contact HR." }
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey)
  const authSupabase = createSupabaseClient(supabaseUrl, authKey)
  const normalizedEmail = email.toLowerCase().trim()

  console.log("[login] Attempting login for:", normalizedEmail)

  // Find the employee by email
  const { data: employee, error } = await supabase
    .from("employees")
    .select("id, email, password_hash, full_name, role, branch, is_active")
    .eq("email", normalizedEmail)
    .single()

  if (error) {
    console.error("[login] DB error fetching employee:", JSON.stringify(error))
  } else if (employee) {
    console.log("[login] Employee found:", employee.email, "| active:", employee.is_active)

    if (!employee.is_active) {
      return { success: false, error: "Account has been deactivated. Contact HR." }
    }

    // Verify the password against the employee table first.
    const valid = await bcrypt.compare(password, employee.password_hash)
    console.log("[login] Employee password valid:", valid)

    if (valid) {
      const token = await createSession({
        id: employee.id,
        email: employee.email,
        full_name: employee.full_name,
        role: employee.role,
        branch: employee.branch,
      })

      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION,
        path: "/",
      })

      console.log("[login] Login successful for:", employee.email)
      return { success: true }
    }
  } else {
    console.log("[login] No employee found for:", normalizedEmail)
  }

  // Fallback to Supabase Auth for deployments that use auth.users + profiles.
  const { data: authData, error: authError } = await authSupabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  })

  if (authError || !authData.user) {
    console.error("[login] Supabase Auth login failed:", authError?.message ?? "No user returned")
    return {
      success: false,
      error:
        "Login backend mismatch. Check the Supabase project/env vars and that demo users exist in the configured database.",
    }
  }

  const { data: profile, error: profileError } = await authSupabase
    .from("profiles")
    .select("full_name, role, branch")
    .eq("id", authData.user.id)
    .single()

  if (profileError) {
    console.error("[login] Profile lookup failed:", JSON.stringify(profileError))
  }

  const token = await createSession({
    id: authData.user.id,
    email: authData.user.email ?? normalizedEmail,
    full_name:
      profile?.full_name ??
      (authData.user.user_metadata?.full_name as string | undefined) ??
      authData.user.email ??
      normalizedEmail,
    role:
      profile?.role ??
      (authData.user.user_metadata?.role as string | undefined) ??
      "Sales",
    branch:
      profile?.branch ??
      (authData.user.user_metadata?.branch as string | undefined) ??
      "Lusaka HQ",
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  })

  console.log("[login] Login successful via Supabase Auth for:", authData.user.email)
  return { success: true }
}

// ─── Logout ──────────────────────────────────────────────────
export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// ─── Get Session (Server Components / Actions) ───────────────
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySession(token)
}

// ─── Get Session from Request (Middleware) ────────────────────
export async function getSessionFromRequest(
  request: Request,
): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get("cookie") ?? ""
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))
  if (!match) return null
  return verifySession(match[1])
}

// ─── Verify Admin Access (HR or CEO) ─────────────────────────
export async function verifyAdminAccess(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) throw new Error("Not authenticated")
  if (!["HR", "CEO"].includes(session.role)) {
    throw new Error("Unauthorized — only HR and CEO can manage employees")
  }
  return session
}
