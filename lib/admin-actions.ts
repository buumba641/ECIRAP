"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { verifyAdminAccess } from "@/lib/auth"
import bcrypt from "bcryptjs"

const VALID_ROLES = ["CEO", "Manager", "HR", "Analyst", "Marketing", "Cashier", "Sales", "Accountant"] as const

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
    const supabase = await createClient()

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10)

    const { error } = await supabase
      .from("employees")
      .insert({
        email: email.toLowerCase().trim(),
        password_hash,
        full_name: fullName,
        role,
        branch,
      })

    if (error) {
      if (error.code === '23505') { // unique violation
        return { error: "An employee with this email already exists" }
      }
      return { error: error.message }
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
    const supabase = await createClient()

    const { error } = await supabase
      .from("employees")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) return { error: error.message }

    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

/** Delete an employee account entirely (soft delete or hard delete). */
export async function deleteEmployee(userId: string) {
  try {
    await verifyAdminAccess()
  } catch (err) {
    return { error: (err as Error).message }
  }

  try {
    const supabase = await createClient()

    // We can do a hard delete for simplicity here, or soft delete:
    const { error } = await supabase.from("employees").delete().eq("id", userId)
    if (error) return { error: error.message }

    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

/** Get all employees. */
export async function getEmployees() {
  try {
    await verifyAdminAccess()
  } catch {
    return []
  }

  try {
    const supabase = await createClient()

    const { data: employees } = await supabase
      .from("employees")
      .select("id, email, full_name, role, branch, avatar_url, is_active, created_at, updated_at")
      .order("full_name", { ascending: true })

    // Provide last_sign_in_at as null for compatibility with previous view
    return (employees ?? []).map((emp) => ({
      ...emp,
      last_sign_in_at: null,
    }))
  } catch (err) {
    console.error("[getEmployees] Error:", err)
    return []
  }
}
