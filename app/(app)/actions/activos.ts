'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAsset(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const invested_amount = parseFloat(formData.get('invested_amount') as string)
    const current_value = formData.get('current_value') ? parseFloat(formData.get('current_value') as string) : null
    const ticker = formData.get('ticker') as string || null
    const quantity = formData.get('quantity') ? parseFloat(formData.get('quantity') as string) : null
    const currency = formData.get('currency') as string || 'ARS'
    const purchase_date = formData.get('purchase_date') as string || null
    const notes = formData.get('notes') as string || null

    if (!name || !type || isNaN(invested_amount)) {
        return { error: 'Nombre, tipo y monto invertido son obligatorios' }
    }

    const { error } = await supabase.from('assets').insert({
        user_id: user.id,
        name,
        type,
        invested_amount,
        current_value: current_value ?? invested_amount,
        ticker,
        quantity,
        currency,
        purchase_date,
        notes
    } as any)

    if (error) {
        console.error(error)
        return { error: 'Error al registrar el activo' }
    }

    revalidatePath('/finanzas/activos')
    return { success: true }
}

export async function updateAssetValue(id: string, current_value: number) {
    const supabase = await createClient()
    const { error } = await (supabase.from('assets') as any)
        .update({ current_value })
        .eq('id', id)

    if (error) return { error: 'Error al actualizar el valor' }

    revalidatePath('/finanzas/activos')
    return { success: true }
}

export async function deleteAsset(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('assets').delete().eq('id', id)
    if (error) return { error: 'Error al eliminar el activo' }

    revalidatePath('/finanzas/activos')
    return { success: true }
}
