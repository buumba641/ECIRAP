"use server"

import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const VALID_ROLES = ["CEO", "Manager", "HR", "Analyst", "Marketing", "Cashier", "Sales", "Accountant"] as const

/** Get an admin Supabase client using the service_role key (server-only). */
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY — required for admin operations")
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** Verify the current user is HR or CEO before admin operations */
async function verifyAdminAccess() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["HR", "CEO"].includes(profile.role)) {
    throw new Error("Unauthorized — only HR and CEO can manage employees")
  }

  return user
}

/** Create a new employee account. */
export async function createEmployee(formData: FormData) {
  try {
    await verifyAdminAccess()
  } catch (err) {
    return { error: (err as Error).message }
  }

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("full_name") as string
  const role = formData.get("role") as string
  const branch = (formData.get("branch") as string) || "Lusaka HQ"

  if (!email || !password || !fullName || !role) {
    return { error: "All fields are required" }
  }

  if (password.length < 4) {
    return { error: "Password must be at least 4 characters" }
  }

  if (!VALID_ROLES.includes(role as typeof VALID_ROLES[number])) {
    return { error: `Invalid role: ${role}` }
  }

  try {
    const admin = createAdminClient()

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
      },
    })

    if (error) return { error: error.message }

    // Update profile with branch (trigger creates the profile row)
    if (data.user) {
      await admin
        .from("profiles")
        .update({ branch })
        .eq("id", data.user.id)
    }

    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

/** Update an employee's role. */
export async function updateEmployeeRole(userId: string, newRole: string) {
  try {
    await verifyAdminAccess()
  } catch (err) {
    return { error: (err as Error).message }
  }

  if (!VALID_ROLES.includes(newRole as typeof VALID_ROLES[number])) {
    return { error: `Invalid role: ${newRole}` }
  }

  try {
    const admin = createAdminClient()

    // Update the profile role
    const { error } = await admin
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) return { error: error.message }

    // Also update user_metadata so it stays in sync
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

/** Delete an employee account entirely. */
export async function deleteEmployee(userId: string) {
  try {
    await verifyAdminAccess()
  } catch (err) {
    return { error: (err as Error).message }
  }

  try {
    const admin = createAdminClient()

    // Delete from Supabase Auth (cascade will delete profile)
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) return { error: error.message }

    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

/** Get all employees with their profile data and auth email. */
export async function getEmployees() {
  try {
    await verifyAdminAccess()
  } catch {
    return []
  }

  try {
    const admin = createAdminClient()

    // Get all users from Auth
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 100 })
    const users = authData?.users ?? []

    // Get all profiles
    const supabase = await createServerClient()
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true })

    // Merge auth + profile data
    return (profiles ?? []).map((profile) => {
      const authUser = users.find((u) => u.id === profile.id)
      return {
        ...profile,
        email: authUser?.email ?? "Unknown",
        last_sign_in_at: authUser?.last_sign_in_at ?? null,
      }
    })
  } catch (err) {
    console.error("[getEmployees] Error:", err)
    return []
  }
}
