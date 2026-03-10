'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSubscription(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'No autenticado' }
    }

    const name = formData.get('name') as string
    const amount = parseFloat(formData.get('amount') as string)
    const currency = formData.get('currency') as string || 'ARS'
    const category = formData.get('category') as string || 'Entretenimiento'
    const cycle = formData.get('cycle') as string || 'monthly'
    const next_date = formData.get('next_date') as string

    if (!name || !amount || !next_date) {
        return { error: 'Faltan campos obligatorios' }
    }

    const { error } = await supabase
        .from('subscriptions')
        .insert({
            user_id: user.id,
            name,
            amount,
            currency,
            category,
            cycle,
            next_date,
            is_active: true
        } as any)

    if (error) {
        console.error('Error insertando suscripcion:', error)
        return { error: 'Ocurrió un error al guardar la suscripción. Revisa los datos.' }
    }

    revalidatePath('/finanzas')
    revalidatePath('/finanzas/suscripciones')
    revalidatePath('/dashboard')

    return { success: true }
}

export async function toggleSubscriptionStatus(id: string, currentStatus: boolean) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'No autenticado' }
    }

    const { error } = await (supabase.from('subscriptions') as any)
        .update({ is_active: !currentStatus })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return { error: 'No se pudo actualizar el estado' }
    }

    revalidatePath('/finanzas/suscripciones')
    return { success: true }
}

export async function deleteSubscription(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'No autenticado' }
    }

    const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return { error: 'No se pudo eliminar la suscripción' }
    }

    revalidatePath('/finanzas/suscripciones')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateSubscription(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const name = formData.get('name') as string
    const amount = parseFloat(formData.get('amount') as string)
    const currency = formData.get('currency') as string || 'ARS'
    const category = formData.get('category') as string
    const cycle = formData.get('cycle') as string
    const next_date = formData.get('next_date') as string

    if (!name || !amount || !next_date) return { error: 'Faltan campos obligatorios' }

    const { error } = await (supabase.from('subscriptions') as any)
        .update({ name, amount, currency, category, cycle, next_date })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: 'Error al actualizar la suscripción' }

    revalidatePath('/finanzas/suscripciones')
    revalidatePath('/dashboard')
    return { success: true }
}
