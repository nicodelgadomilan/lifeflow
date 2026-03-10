'use server'

import { createAdminClient, verifyAdminAccess } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ADMIN_GUARD = async () => {
    const ok = await verifyAdminAccess()
    if (!ok) throw new Error('No autorizado')
}

/**
 * Habilita o deshabilita un usuario de la plataforma
 */
export async function toggleUserStatus(
    userId: string,
    currentlyEnabled: boolean,
    reason: string | null
) {
    await ADMIN_GUARD()
    const admin = createAdminClient()

    const newStatus = !currentlyEnabled

    // Upsert en user_status
    const { error } = await (admin as any)
        .from('user_status')
        .upsert({
            user_id: userId,
            is_enabled: newStatus,
            disabled_reason: newStatus ? null : (reason || 'Sin especificar'),
            disabled_at: newStatus ? null : new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

    if (error) return { error: 'Error al cambiar el estado del usuario' }

    revalidatePath('/admin')
    return { success: true }
}

/**
 * Asigna o actualiza el plan de plataforma de un usuario
 */
export async function assignPlatformPlan(
    userId: string,
    plan: string,
    amount: number,
    notes: string
) {
    await ADMIN_GUARD()
    const admin = createAdminClient()

    // Cancela planes anteriores activos
    await (admin as any)
        .from('platform_subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('status', 'active')

    // Inserta nuevo plan
    const { error } = await (admin as any)
        .from('platform_subscriptions')
        .insert({
            user_id: userId,
            plan,
            status: 'active',
            amount: amount || 0,
            currency: 'ARS',
            notes: notes || null,
            started_at: new Date().toISOString(),
        })

    if (error) return { error: 'Error al asignar el plan' }

    revalidatePath('/admin')
    return { success: true }
}

/**
 * Elimina una suscripción de plataforma
 */
export async function removePlatformSub(subId: string) {
    await ADMIN_GUARD()
    const admin = createAdminClient()

    const { error } = await (admin as any)
        .from('platform_subscriptions')
        .delete()
        .eq('id', subId)

    if (error) return { error: 'Error al eliminar la suscripción' }

    revalidatePath('/admin')
    return { success: true }
}
