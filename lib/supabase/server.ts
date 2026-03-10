import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'master@gmail.com'

/**
 * Cliente Supabase normal (anon key) para server components
 */
export async function createClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                    } catch { }
                },
            },
        }
    )
}

/**
 * Cliente Supabase con service_role — solo para uso en rutas de admin Server-side
 */
export function createAdminClient() {
    return createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

/**
 * Verifica si el usuario actual es el administrador master
 */
export async function verifyAdminAccess(): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email === ADMIN_EMAIL
}
