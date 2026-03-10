import { createAdminClient, verifyAdminAccess } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const isAdmin = await verifyAdminAccess()
    if (!isAdmin) redirect('/admin/login')

    const admin = createAdminClient()

    // 1. Todos los usuarios de auth
    const { data: { users: authUsers }, error: usersError } = await (admin.auth as any).admin.listUsers({ perPage: 1000 })
    if (usersError) console.error('Error fetching users:', usersError)

    const users = (authUsers || []) as any[]

    // 2. Estado de cada usuario (habilitado/deshabilitado)
    const { data: statusRows } = await (admin as any)
        .from('user_status')
        .select('*')

    const statusMap: Record<string, any> = {}
    for (const s of (statusRows || [])) statusMap[s.user_id] = s

    // 3. Suscripciones de la plataforma (plan que tiene cada usuario)
    const { data: platformSubs } = await (admin as any)
        .from('platform_subscriptions')
        .select('*')

    const platformSubsMap: Record<string, any[]> = {}
    for (const s of (platformSubs || [])) {
        if (!platformSubsMap[s.user_id]) platformSubsMap[s.user_id] = []
        platformSubsMap[s.user_id].push(s)
    }

    // 4. Suscripciones de servicios de cada usuario (Netflix, gym, etc.)
    const { data: allSubs } = await (admin as any)
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })

    const subsMap: Record<string, any[]> = {}
    for (const s of (allSubs || [])) {
        if (!subsMap[s.user_id]) subsMap[s.user_id] = []
        subsMap[s.user_id].push(s)
    }

    // 5. Transacciones recientes por usuario (últimas 100 globales)
    const { data: allTx } = await (admin as any)
        .from('transactions')
        .select('user_id, created_at, amount, type, currency')
        .order('created_at', { ascending: false })
        .limit(200)

    const txMap: Record<string, any[]> = {}
    for (const t of (allTx || [])) {
        if (!txMap[t.user_id]) txMap[t.user_id] = []
        txMap[t.user_id].push(t)
    }

    // 6. Construir lista enriquecida de usuarios
    const enrichedUsers = users
        .filter(u => u.email !== 'master@gmail.com')
        .map(u => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            email_confirmed_at: u.email_confirmed_at,
            is_enabled: statusMap[u.id]?.is_enabled ?? true,
            disabled_reason: statusMap[u.id]?.disabled_reason ?? null,
            platform_subs: platformSubsMap[u.id] || [],
            subscriptions: subsMap[u.id] || [],
            recent_tx: txMap[u.id] || [],
        }))

    // Métricas globales
    const totalUsers = enrichedUsers.length
    const activeUsers = enrichedUsers.filter(u => u.is_enabled).length
    const totalSubs = (allSubs || []).filter(s => s.is_active).length
    const newUsersThisWeek = enrichedUsers.filter(u => {
        const d = new Date(u.created_at)
        const now = new Date()
        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
    }).length

    return (
        <AdminDashboard
            users={enrichedUsers}
            stats={{ totalUsers, activeUsers, totalSubs, newUsersThisWeek }}
        />
    )
}
