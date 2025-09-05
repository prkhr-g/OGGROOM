import { createServerClient as _createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for use in Server Components, Route Handlers, and Server Actions.
 * It relies on cookies for authentication.
 */
export function createServerClient() {
  const cookieStore = cookies()

  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

/**
 * Creates a Supabase client for use as an admin client with the service role key.
 * This should only be used in secure server-side environments.
 */
export function createAdminClient() {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    if (!supabaseServiceKey) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for admin operations")
    }
    // Note: This uses the base createClient from @supabase/supabase-js, not the ssr one
    return _createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
