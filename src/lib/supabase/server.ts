import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  // NOTE: The service role key should be stored securely in environment variables.
  // The '!' asserts that the environment variables are non-null.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createServerClient(
    supabaseUrl,
    // Use the service role key for admin operations
    process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseServiceRoleKey : supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      auth: {
        // By using the service role key, we can bypass RLS for admin tasks.
        // However, it's crucial this is only done on the server.
        // We are checking for the presence of the service role key to decide
        // whether to disable auto-refresh. For anonymous users, we want it enabled.
        autoRefreshToken: !process.env.SUPABASE_SERVICE_ROLE_KEY,
        persistSession: !process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    }
  )
}
