import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — safe to ignore.
          }
        },
      },
    },
  )
}

/** Run a Supabase query with a timeout. Returns data or null on any failure. */
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: unknown }>,
  timeoutMs = 8000,
): Promise<T | null> {
  try {
    const result = await Promise.race([
      queryFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase query timeout")), timeoutMs),
      ),
    ])
    if (result.error) {
      console.error("[safeQuery] Supabase error:", result.error)
      return null
    }
    return result.data
  } catch (err) {
    console.error("[safeQuery] Query failed:", err)
    return null
  }
}
